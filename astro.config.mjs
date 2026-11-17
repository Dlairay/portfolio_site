// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://dlairay.github.io',
  base: '/portfolio_site',
  output: 'static',
  integrations: [mdx()],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
