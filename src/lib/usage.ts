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

/** Counts `class="… name …"` tokens (also inside class:list / template strings). */
const countClass = (src: string, cls: string) => {
  const c = cls.replace(/[-]/g, '\\-');
  const token = `(?<![\\w-])${c}(?![\\w-])`;
  const re = new RegExp(`class=(?:"[^"]*?${token}[^"]*"|\\{\`[^\`]*?${token}[^\`]*\`\\})`, 'g');
  return (strip(src).match(re) ?? []).length;
};

type Counter = (src: string) => number;

/** Routes that end up containing a match, directly or through other components (BaseLayout → every page). */
function routesMatching(counter: Counter, self?: string, seen = new Set<string>()): Set<string> {
  const out = new Set<string>();
  for (const p of pages) if (counter(p.src) > 0) out.add(p.route);
  for (const c of containers) {
    if (c.name === self || seen.has(c.name) || counter(c.src) === 0) continue;
    seen.add(c.name);
    if (c.name === 'BaseLayout') { for (const p of pages) out.add(p.route); continue; }
    for (const r of routesMatching((src) => count(src, c.name), c.name, seen)) out.add(r);
  }
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

function usageBy(counter: Counter, self?: string): Usage {
  const direct = pages
    .map((p) => ({ route: p.route, label: pageLabel(p.route), uses: counter(p.src) }))
    .filter((d) => d.uses > 0)
    .sort((a, b) => b.uses - a.uses || a.route.localeCompare(b.route));
  const inside = containers
    .filter((c) => c.name !== self)
    .map((c) => ({ name: c.name, uses: counter(c.src) }))
    .filter((c) => c.uses > 0);
  const routes = [...routesMatching(counter, self)].sort();
  return {
    direct,
    directTotal: direct.reduce((a, d) => a + d.uses, 0),
    inside,
    affectedPages: routes.reduce((a, r) => a + pageWeight(r), 0),
    affected: routes.map(pageLabel),
  };
}

/** Where a component (by file name) is used. */
export const usage = (name: string) => usageBy((src) => count(src, name), name);
/** Where a global layout class (e.g. "section", "grid") is used. */
export const classUsage = (cls: string) => usageBy((src) => countClass(src, cls));

const cssSrc = {
  ...(import.meta.glob('../styles/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>),
  ...compSrc,
  ...layoutSrc,
  ...pageSrc,
};
/** How many times a CSS variable is referenced with var(--name), and in which files. */
export function tokenUsage(token: string) {
  const re = new RegExp(`var\\(${token.replace(/[-]/g, '\\-')}\\)`, 'g');
  const files = Object.entries(cssSrc)
    .map(([file, src]) => ({ file: file.replace('../', 'src/'), uses: (src.match(re) ?? []).length }))
    .filter((f) => f.uses > 0);
  return { total: files.reduce((a, f) => a + f.uses, 0), files };
}

/** The first doc comment in a component file (its description). */
export function describe(name: string): string {
  const src = Object.entries(compSrc).find(([f]) => f.endsWith(`/${name}.astro`))?.[1] ?? '';
  const m = src.match(/\/\*\*([\s\S]*?)\*\//);
  return m ? m[1].replace(/^\s*\* ?/gm, '').replace(/\s+/g, ' ').trim() : '';
}
