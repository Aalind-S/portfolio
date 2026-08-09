# Aalind Singh | Portfolio & Blog Website

A premium, responsive developer portfolio and personal blog built with **Astro** and optimized for **Cloudflare Pages/Workers**. 

Features an interactive resume page (with print-optimized stylesheets for direct A4 PDF exports), a client-side search/filter solutions blog, light/dark theme switching, and dynamic accent color customization.

---

## ✍️ How to Add New Blog Posts

The blog uses **Astro Content Collections** to compile Markdown files into dynamic static routes. To add a new post:

### Step 1: Create a Markdown File
Create a new `.md` file inside the `src/content/blog/` directory. The filename will automatically serve as the URL slug.
* Example: `src/content/blog/my-new-problem-solution.md` will compile to `/blog/my-new-problem-solution`.

### Step 2: Configure Frontmatter Metadata
Every Markdown file must begin with a YAML frontmatter block (enclosed by `---`) specifying metadata properties. Copy and customize the block below at the very top of your new file:

```yaml
---
title: "How I Solved My Specific Technical Problem"
description: "A short, engaging 1-2 sentence summary of the issue you faced and the core strategy you used to solve it."
pubDate: 2026-08-09
readTime: "5 min read"
tags: ["FastAPI", "Python", "Docker", "Debugging"]
featured: false
---
```

* **`pubDate`**: Format as `YYYY-MM-DD`. Blog listings are sorted automatically by this date (newest first).
* **`featured`**: Set to `true` if you want this post to be highlighted on the homepage's **Latest Solutions** panel.

### Step 3: Write Your Post Content
Below the closing `---` frontmatter, write your post using standard Markdown:

```markdown
Here is an introduction paragraph.

## The Challenge
Describe the problem in detail. Use code blocks for snippets:

```python
def buggy_function():
    # explain the bug
    pass
```

## The Solution
Explain how you resolved the issue.

> [!TIP]
> Add helpful Callouts like this to highlight key takeaways!
```

---

## ⚙️ How to Customize Personal Details (Constants)

You do not need to hunt through different pages to change your contact details, social URLs, projects, or skill listings. Everything is centralized in **`src/constants.ts`**:

* **`SITE_METADATA`**: Edit your name, email, phone number, location, and social links.
* **`RESUME_GDRIVE_LINK`**: Change this URL to point to a direct download or viewer link for your offline PDF resume.
* **`PROJECTS`**: Add or modify the cards displayed in the **Featured Projects** grid. Setting `featured: true` places them on the homepage.
* **`SKILLS`**: Customize the tags loaded onto your skills dashboard.

---

## 🧞 Development Commands

Run all commands from your terminal in the root directory:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the interactive local dev server at `http://localhost:4321` |
| `npm run build` | Compiles the production bundle to the `./dist/` directory |
| `npm run preview` | Previews the compiled bundle locally in a Cloudflare environment |
| `npx astro dev stop` | Stops the background development server |

---

## ☁️ Cloudflare Pages Hosting

This site compiles cleanly using `@astrojs/cloudflare`. To deploy it to Cloudflare:

1. Push your code to a **GitHub** repository.
2. Go to your **Cloudflare Dashboard** -> **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.
3. Choose your repository and set the following build settings:
   * **Framework Preset**: `Astro`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Click **Save and Deploy**. Cloudflare will automatically build and deploy your site every time you push to your `main` branch.
