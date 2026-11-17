import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/work',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      oneLiner: z.string(),
      year: z.number(),
      dateRange: z.string(),
      status: z.string(),
      featured: z.boolean().default(false),
      order: z.number(),
      accent: z.string().optional(),
      role: z.string(),
      context: z.string(),
      tags: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      video: z.string().optional(),
      cover: image(),
      coverAlt: z.string(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      logo: image().optional(),
      logoAlt: z.string().optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string().optional() })).default([]),
      highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      // Optional storytelling fields. Fill these in by hand; the site falls back to `oneLiner`.
      problem: z.string().optional(),
      insight: z.string().optional(),
      // Headline takeaway shown on spotlight rows (featured projects).
      takeaway: z.string().optional(),
      // Optional override for the card's tag chip, e.g. "Research · MIT".
      chip: z.string().optional(),
    }),
});

export const collections = { work };
