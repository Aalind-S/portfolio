import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // New Content Layer glob loader

const blogCollection = defineCollection({
  // Loads all markdown files in src/content/blog/
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    readTime: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
