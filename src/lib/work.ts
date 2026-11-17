import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;

/** Used only when a project has no `accent` in its frontmatter. */
const FALLBACK_ACCENTS = ['#5B8CFF', '#3DDC97', '#C77DFF', '#FF5D8F', '#4CC9F0', '#FFD166', '#9EF01A'];

export const isTodo = (v?: string) => !v || /^TODO\b/i.test(v.trim());

export async function getWork(): Promise<Work[]> {
  const all = await getCollection('work');
  return all.sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.order - b.data.order,
  );
}

export function accentFor(w: Work): string {
  return w.data.accent ?? FALLBACK_ACCENTS[(w.data.order - 1) % FALLBACK_ACCENTS.length];
}

/** Card chip: "<kind> · <org>". Override per project with the `chip` frontmatter field. */
export function chipFor(w: Work): string | null {
  const { chip, context, title } = w.data;
  if (chip) return chip;
  if (isTodo(context)) return null;
  if (/startup/i.test(context)) return `Startup · ${title}`;
  const client = context.match(/^Client engagement for (.+)$/i);
  if (client) return `Client · ${client[1]}`;
  if (/hackathon/i.test(context)) return 'Hackathon';
  const partner = context.match(/SUTD.*with (.+)$/i);
  if (partner) return `SUTD × ${partner[1]}`;
  if (/SUTD/.test(context)) return 'School · SUTD';
  return context;
}

export const url = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
