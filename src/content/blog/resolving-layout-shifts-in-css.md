---
title: "Resolving Cumulative Layout Shifts (CLS) in CSS Grids"
description: "How I tracked down and eliminated layout instability in a dynamic grid component, boosting Google PageSpeed Performance from 60 to 98."
pubDate: 2026-08-01
readTime: "6 min read"
tags: ["CSS", "Web Performance", "Layout", "DevTools"]
featured: true
---

Layout stability is one of the most critical aspects of the modern user experience. In this blog post, I walk through how I investigated and resolved a severe layout shifting problem in a media-rich grid layout, improving our Cumulative Layout Shift (CLS) score from a red-zone **0.34** down to a perfect **0.01**.

## The Problem: Dynamic Content Jumps

Our project featured a responsive grid layout displaying user-generated cards with images. We noticed that during load, page elements would jitter and jump downward multiple times. It felt choppy and frustrating.

According to Google Lighthouse, our CLS was **0.34**. Anything above **0.25** is flagged as "Poor" performance.

### How I Investigated the Shift

I utilized the **Performance panel** in Chrome DevTools:
1. Checked **Web Vitals** and started recording.
2. Refreshed the page to capture the load cycle.
3. In the recording summary, I expanded the **Experience** row, which lists layout shift events.
4. Hovering over the red blocks showed exactly which elements shifted and where they moved.

The DevTools indicated that the `.project-card` containers were shifting downwards by 120 pixels when their child images finished loading.

## The Cause: Image Dimensions Collapse

In our layout, images had style declarations like:
```css
img {
  width: 100%;
  height: auto;
}
```
While this is standard for responsive images, it has a major caveat: **until the image bytes are downloaded, the browser doesn't know its height.** Therefore, it renders the image as 0px tall. Once the image loads, the browser suddenly expands it, pushing all content below it down.

Furthermore, we were using a CSS grid with `grid-template-rows: auto`. The rows collapsed initially and expanded later, amplifying the visual jumping.

## The Solution: Aspect Ratios and Placeholders

To fix this layout shift permanently, I implemented three adjustments:

### 1. Explicit Aspect Ratios in CSS

Modern browsers allow setting `aspect-ratio` on elements. This lets the browser calculate the box height immediately using only the width (which is defined by the grid column width).

I updated our image containers:
```css
.card-media-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9; /* Reserves space immediately! */
  background-color: var(--bg-tertiary);
  overflow: hidden;
  border-radius: var(--border-radius-sm);
}

.card-media-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

By putting the image inside an aspect-ratio locked container, the browser allocates exactly `16:9` space even if the image is still downloading.

### 2. Standard HTML `width` and `height` attributes

I made sure all images in our HTML had native attributes:
```html
<img 
  src="/images/project-thumb.jpg" 
  width="640" 
  height="360" 
  alt="Project Thumbnail" 
/>
```
Modern browsers use these attributes to calculate the aspect-ratio automatically before loading stylesheets, acting as a secondary line of defense.

### 3. Grid Row Constraints

To keep the grid itself stable, I transitioned from `grid-template-rows: auto` to a more structured grid pattern using `grid-auto-rows: 1fr` where appropriate, or wrapping content card heights using `min-height` parameters so cards maintain consistent heights regardless of text lengths.

## The Results

After implementing these fixes and deploying, I ran the audit again:

| Metric | Before Fix | After Fix | Status |
| :--- | :---: | :---: | :---: |
| **CLS Score** | `0.34` | `0.01` | **Passed (Good)** |
| **Lighthouse Performance** | `68` | `98` | **Passed (Excellent)** |

Now the layout loads smoothly without any sudden jumping, even on slow 3G networks.

> [!TIP]
> Always set `aspect-ratio` on dynamic media containers or provide default height blockouts when lazy loading components. Your users (and search engine rankings) will thank you!
