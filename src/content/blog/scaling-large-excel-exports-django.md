---
title: "Scaling Large Excel Exports in Django with Server-Side Cursors"
description: "How I optimized a multi-sheet report generation process with millions of rows, reducing memory usage by 80% and eliminating query timeouts."
pubDate: 2026-08-08
readTime: "7 min read"
tags: ["Django", "PostgreSQL", "Python", "Database", "Web Performance"]
featured: true
---

Generating Excel reports is a routine task in backend engineering. However, when the report spans multiple sheets, incorporates complex database joins, and scales to millions of rows, standard Django QuerySets and popular data libraries like `pandas` quickly lead to out-of-memory (OOM) crashes and database connection timeouts.

In this post, I detail how I redesigned a large export pipeline to stream millions of rows from PostgreSQL using cursor-based pagination and Django's `iterator()` mechanism, writing them directly to disk using `openpyxl`'s memory-optimized write-only mode.

## The Challenge: Memory Exhaustion and Timeouts

Our task was to generate a single Excel workbook containing three distinct sheets:
* **Sheet 1**: A media-rich tabular dataset requiring multiple database joins, implemented using **raw SQL queries** instead of standard Django ORM relationships to maximize performance.
* **Sheets 2 & 3**: Straightforward exports from single tables.

All sheets shared one common blocker: **huge row counts**. 

Initially, attempting to fetch these records using standard Django QuerySets caused two critical failures:
1. **Database Timeouts**: Deep pagination using SQL `LIMIT` and `OFFSET` became exponentially slower.
2. **Server Crashes**: Storing millions of model instances in RAM (and using Pandas to buffer them in-memory to build the Excel sheets) triggered OOM termination on our container instances.

---

## Why Offset Pagination Doesn't Scale

When working with large tables, the standard pagination approach uses `LIMIT` and `OFFSET`:
```sql
SELECT * FROM my_table ORDER BY id LIMIT 2000 OFFSET 1000000;
```
For the database, this query is deceptively expensive. PostgreSQL cannot simply jump to row `1,000,000`. It must scan through all preceding `1,000,000` records, discard them, and then return the next `2,000` rows. As your pagination iterates deeper (e.g., offsets of several millions), this O(N) operation takes seconds or minutes, leading to gate-level query timeouts.

### Keyset (Cursor-Based) Pagination
To achieve O(log N) performance, we transitioned to **keyset pagination**. Instead of relying on offsets, we filter by the primary key or a sequential index of the last processed record:
```sql
SELECT * FROM my_table WHERE id > 1000000 ORDER BY id LIMIT 2000;
```
Because the `id` field is indexed, the database performs a rapid index lookup to instantly locate the starting boundary, maintaining consistent sub-millisecond execution times regardless of pagination depth.

---

## Keyset Pagination & Streaming Strategies

For **Sheets 2 and 3** (which were straightforward database tables), we used Django's built-in **`iterator(chunk_size=2000)`** to fetch rows incrementally without loading the entire QuerySet into memory:
```python
queryset = MyModel.objects.all().order_by('id')
for obj in queryset.iterator(chunk_size=2000):
    write_to_csv(obj)
```

However, for **Sheet 1**, which required multiple complex database joins, we bypassed the ORM's `select_related` and `prefetch_related` completely. When dealing with millions of rows, Django ORM's relationship pre-fetching consumes massive memory to instantiate Python objects and link them. 

Instead, I wrote a **raw SQL query** using cursor-based pagination directly. This allowed PostgreSQL to execute a highly optimized set of joins at the database layer, returning flat rows that were read sequentially:
```python
# Sheet 1: Raw SQL keyset (cursor-based) streaming
last_seen_id = 0
chunk_size = 2000

while True:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT t1.id, t1.field1, t2.field2, t3.field3 
            FROM table1 t1
            JOIN table2 t2 ON t1.t2_id = t2.id
            JOIN table3 t3 ON t1.t3_id = t3.id
            WHERE t1.id > %s
            ORDER BY t1.id
            LIMIT %s
            """,
            [last_seen_id, chunk_size]
        )
        rows = cursor.fetchall()
        if not rows:
            break
        
        for row in rows:
            write_to_csv(row)
            last_seen_id = row[0] # Update key cursor
```

### Under the Hood: Postgres Server-Side Cursors
Because we were using PostgreSQL, Django implements `iterator()` using a **server-side cursor**. 

Instead of pulling all records in a single client fetch, the driver executes the query on the database server and declares a named cursor. It then fetches rows incrementally in batches matching the `chunk_size`:

```sql
DECLARE "django_cursor_01" NO SCROLL CURSOR FOR SELECT * FROM my_table;
FETCH 2000 FROM "django_cursor_01";
FETCH 2000 FROM "django_cursor_01";
-- ... repeating until no rows are left
CLOSE "django_cursor_01";
```

This keeps the memory footprint on the web server completely flat.

### The Trade-offs of `iterator()`
1. **Cache Bypassing**: `iterator()` bypasses Django's QuerySet caching entirely. If you attempt to loop through the query results a second time, Django will hit the database again. In our report generation pipeline, this was not an issue since we only read and write the data in a single, one-way stream.
2. **PgBouncer Connection Pooling Nuance**: Named server-side cursors are stateful and tied to a single database connection. If your system uses **PgBouncer in Transaction Pooling mode**, server-side cursors will break. This is because PgBouncer intercepts queries at the transaction boundary and can route subsequent `FETCH` statements to completely different database connections that do not possess the cursor state. (In our case, we bypassed PgBouncer for this specific background task, letting it communicate directly with Postgres, which resolved this risk).

---

## Memory-Safe Sheet Compilation: Ditching Pandas for Openpyxl

With the database queries optimized for streaming, the final bottleneck was constructing the `.xlsx` file itself. 

Initially, `pandas` was used to buffer the data inside a DataFrame and output it to Excel. However, `pandas` loads the entire dataset into memory to construct its structures. For three sheets of this size, memory consumption reached gigabytes.

I replaced `pandas` with `openpyxl` using its highly optimized **Write-Only Mode**:
```python
from openpyxl import Workbook

wb = Workbook(write_only=True) # Enables streaming mode!
ws = wb.create_sheet(title="Large Join Report")

# We stream rows directly from the CSV/Database into the sheet
for row_data in fetch_records_stream():
    ws.append(row_data) # Appends and streams directly to disk!
    
wb.save("report.xlsx")
```

### The Catch with Write-Only Mode
When a workbook is initialized with `write_only=True`, `openpyxl` streams the XML data directly to a temporary file on disk, keeping the active memory consumption close to zero. 

The compromise is that **cells cannot be modified programmatically once they are appended**, and you cannot read back data from the sheet. For static report generation, this worked perfectly in our favor, allowing us to compile three huge sheets with flat, negligible RAM usage.

---

## Summary of Results

By combining keyset streaming with write-only document compilation, we transformed a failing batch process into a stable, constant-memory stream:

* **Database Stability**: Eliminated query timeouts completely.
* **Execution Time**: The job finishes twice as fast because the database index lookups bypass offset-discard iterations.
