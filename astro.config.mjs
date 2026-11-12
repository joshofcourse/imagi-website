// @ts-check
import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * GitHub Pages serves the preview under a sub-path (e.g. /imagi-website/).
 * When SITE_BASE is set (only in the GitHub deploy workflow), this rewrites root links
 * in the built HTML/CSS to include it. Local dev and Stacki are unaffected.
 */
const base = (process.env.SITE_BASE || '').replace(/\/$/, '');
function prefixForSubpath() {
  return {
    name: 'prefix-for-subpath',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!base) return;
        const root = fileURLToPath(dir);
        const walk = async (d) => (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])))).flat();
        for (const file of (await walk(root)).filter((f) => /\.(html|css)$/.test(f))) {
          const src = await readFile(file, 'utf8');
          const out = src
            .replace(/(href|src|action|poster)="\/(?!\/)/g, `$1="${base}/`)
            .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`)
            .replace(/srcset="\/(?!\/)/g, `srcset="${base}/`);
          if (out !== src) await writeFile(file, out);
        }
      },
    },
  };
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://imagilabs.com',
  devToolbar: { enabled: false },
  integrations: [prefixForSubpath()],
});
