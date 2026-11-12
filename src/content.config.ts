// Stacki's CMS reads this file with esbuild — keep `esbuild` in devDependencies.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * FAQs — one Markdown file per question in src/content/faqs/<group>/.
 * The Markdown body is the answer. `group` decides which page/list shows it.
 */
const faqs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    /** Which list it belongs to, e.g. "pricing", "safety", "ambassadors", "contact", or an FAQ-page topic */
    group: z.string(),
    /** Order within the group (lowest first) */
    order: z.number().default(0),
  }),
});

/** Blog authors — one Markdown file each; the body is the bio. */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    /** Photo path in /public, e.g. /images/blog/sari.jpg */
    avatar: z.string().optional(),
  }),
});

/** Blog posts — one Markdown file each; the body is the article. */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    /** Short summary for cards and search results */
    description: z.string(),
    date: z.coerce.date(),
    author: reference('authors'),
    /** Cover image path in /public */
    image: z.string(),
    imageAlt: z.string().default(''),
    tags: z.array(z.string()).default([]),
    /** Hide a post without deleting it */
    published: z.boolean().default(true),
  }),
});

/** Press coverage — one Markdown file per article (no body needed). */
const press = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/press' }),
  schema: z.object({
    /** Outlet or headline, e.g. "TechCrunch: imagi Raises $4.5M" */
    title: z.string(),
    summary: z.string(),
    url: z.string().url(),
    /** Optional thumbnail in /public */
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

/** Legal pages (Privacy, Terms…) — the Markdown body is the page. */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** e.g. "Last updated: May 2026" */
    updated: z.string().optional(),
  }),
});

export const collections = { faqs, authors, posts, press, legal };
