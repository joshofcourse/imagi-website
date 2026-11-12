/**
 * Where is each component used? Reads the source of every page, layout and component at build
 * time and counts `<ComponentName` tags, so the /styleguide numbers stay accurate as pages change.
 */
const pageSrc = import.meta.glob('../pages/**/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const compSrc = import.meta.glob('../components/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const layoutSrc = import.meta.glob('../layouts/*.astro', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Pages generated from one template (collections) */
const n = (g: Record<string, unknown>) => Object.keys(g).length;
const templatePages: Record<string, { label: string; count: number }> = {
  '/blog/[slug]': { label: `Blog posts (/blog/…, ${n(import.meta.glob('../content/posts/*.md'))} pages)`, count: n(import.meta.glob('../content/posts/*.md')) },
  '/blog/author/[author]': { label: `Author pages (/blog/author/…, ${n(import.meta.glob('../content/authors/*.md'))} pages)`, count: n(import.meta.glob('../content/authors/*.md')) },
  '/[legal]': { label: `Legal pages (${n(import.meta.glob('../content/legal/*.md'))} pages)`, count: n(import.meta.glob('../content/legal/*.md')) },
};

const routeOf = (file: string) => {
  let r = file.replace('../pages', '').replace(/\.astro$/, '').replace(/\/index$/, '') || '/';
  return r === '' ? '/' : r;
};

const strip = (src: string) =>
  src
    .replace(/^import .*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
const count = (src: string, name: string) => (strip(src).match(new RegExp(`<${name}[\\s/>]`, 'g')) ?? []).length;

const pages = Object.entries(pageSrc)
  .map(([file, src]) => ({ route: routeOf(file), src }))
  .filter((p) => p.route !== '/styleguide');
const containers = [
  ...Object.entries(compSrc).map(([file, src]) => ({ name: file.split('/').pop()!.replace('.astro', ''), src })),
  ...Object.entries(layoutSrc).map(([file, src]) => ({ name: file.split('/').pop()!.replace('.astro', ''), src })),
];

const pageLabel = (route: string) => templatePages[route]?.label ?? route;
const pageWeight = (route: string) => templatePages[route]?.count ?? 1;

/** Routes that end up containing `name`, directly or through other components (BaseLayout → every page). */
function routesUsing(name: string, seen = new Set<string>()): Set<string> {
  const out = new Set<string>();
  if (seen.has(name)) return out;
  seen.add(name);
  if (name === 'BaseLayout') {
    for (const p of pages) out.add(p.route);
    return out;
  }
  for (const p of pages) if (count(p.src, name) > 0) out.add(p.route);
  for (const c of containers) if (c.name !== name && count(c.src, name) > 0) for (const r of routesUsing(c.name, seen)) out.add(r);
  return out;
}

export interface Usage {
  /** Tags written directly in page files */
  direct: { route: string; label: string; uses: number }[];
  directTotal: number;
  /** Other components / layouts that contain it */
  inside: { name: string; uses: number }[];
  /** Every page that changes if you edit it (counting template pages individually) */
  affectedPages: number;
  affected: string[];
}

export function usage(name: string): Usage {
  const direct = pages
    .map((p) => ({ route: p.route, label: pageLabel(p.route), uses: count(p.src, name) }))
    .filter((d) => d.uses > 0)
    .sort((a, b) => b.uses - a.uses || a.route.localeCompare(b.route));
  const inside = containers
    .filter((c) => c.name !== name)
    .map((c) => ({ name: c.name, uses: count(c.src, name) }))
    .filter((c) => c.uses > 0);
  const routes = [...routesUsing(name)].sort();
  return {
    direct,
    directTotal: direct.reduce((a, d) => a + d.uses, 0),
    inside,
    affectedPages: routes.reduce((a, r) => a + pageWeight(r), 0),
    affected: routes.map(pageLabel),
  };
}

/** The first doc comment in a component file (its description). */
export function describe(name: string): string {
  const src = Object.entries(compSrc).find(([f]) => f.endsWith(`/${name}.astro`))?.[1] ?? '';
  const m = src.match(/\/\*\*([\s\S]*?)\*\//);
  return m ? m[1].replace(/^\s*\* ?/gm, '').replace(/\s+/g, ' ').trim() : '';
}
