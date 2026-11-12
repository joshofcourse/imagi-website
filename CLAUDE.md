# imagi website — Astro + Stacki

Rebuild of imagilabs.com in the new imagi brand, from the Figma file **[INT] - Imagi Website Internal** (Pages (new brand) + the design system).
Run with `npm run dev` (Astro 7 runs the dev server in the background on http://localhost:4322 if 4321 is taken; `npx astro dev stop` to stop it).

## Working alongside Stacki
This project is edited visually in Stacki *and* by Claude. Stacki autosaves to the source files ~300ms after each edit.

- **Take turns on files.** Don't edit a file Claude is changing (or vice versa) — Stacki's autosave can overwrite it.
- **Commit in Stacki (⌥H) before handing work to Claude**, so there's a checkpoint to diff/roll back.
- **Claude does not run branch, stash, checkout, reset or merge commands** — Stacki owns git operations. Claude may only commit when asked.
- **Keep markup Stacki-editable:** page copy lives as plain text in `src/pages/*.astro`; cards and sections are components with props and slots. Don't use `.map()` loops or computed expressions in page templates — lists that repeat (FAQs, posts, press) come from content collections and are looped inside components.
- Stacki reads `src/content.config.ts` with esbuild — keep `esbuild` in devDependencies. New collections need a dev-server restart.

## Preview hosting
Public preview: https://joshofcourse.github.io/imagi-website/ (repo `joshofcourse/imagi-website`). Every push to `main` rebuilds it via `.github/workflows/deploy.yml` (~1 min). That build sets `SITE_BASE` so links work under the `/imagi-website/` sub-path, and `PUBLIC_NOINDEX` so search engines skip it — neither applies to local dev. Keep links root-relative (`/pricing`, `/images/…`); the build prefixes them.

## Design rules (keep it consistent)
- **Tokens only.** Colours, spacing, radius, shadows and type sizes come from `src/styles/global.css` (mirrors the Figma Brand / Tokens / Theme variables). Never hard-code a hex value or pixel spacing in a page.
- **Type:** one `h1` per page (Hero, Display L). Section headings are Display S (`SectionHeader`). Card titles are Heading M. Body copy Body M/L. Use the `.text-*` classes, which match the 12 Figma text styles.
- **Sections:** every block on a page is a `<Section>` — same vertical padding everywhere. Alternate tones to separate sections: `page` (white) / `subtle` (cream) / `muted` (sand). `dark` (forest) is for rare emphasis; the closing CTA uses `CtaBand`.
- **Shapes:** cards and images use radius lg (32px); inputs radius sm; buttons and badges are pills. No strokes on cards, soft Forest-tinted shadows only.
- **No floating decoration.** No stray shapes, tape strips, wavy dividers, dots or loose icons. Keep real imagery (photos, product screenshots, logos). Icons only inside `IconDisc` or next to text.
- **Buttons:** primary (Forest) for the main action, outline for the secondary one, `secondary` (Lime) on dark backgrounds.

## Components (`src/components/`)
| Component | Use |
|---|---|
| `Hero` | First section of every page. Props `eyebrow`, `title`, `image`/`imageAlt` (splits into two columns), `tone`. Slots: default (lead), `meta` (badges), `actions` (buttons), `media`. |
| `Section` | Wrapper for every other block. Props `tone`, `spacing` (`default`/`tight`), `id`, `narrow`. |
| `SectionHeader` | Eyebrow + Display S heading + intro (slot). `align="left"` for left-aligned. |
| `Split` | Image beside text; `reverse` flips it. Slot = text; `media` slot for custom media. |
| `Grid` | `cols={2|3|4}` responsive grid. |
| `Card` | The only card. `title`, `tone`, `image`, `icon` + `iconTone`, `eyebrow`, `band` (coloured header), `href` + `linkLabel`. Slots: default, `tags`, `footer`. |
| `Badge` | Pill label. `tone` brand / neutral / dark / accent / outline, `size` s/m. |
| `Button` | Pill button. `variant` primary / secondary / outline / inverse, `size` s/m/l, `arrow`, `external`. |
| `IconDisc` + `Icon` | Icon tile / bare line icon. Icon names are listed in `Icon.astro`. |
| `Checklist` | `<li>` list with check or cross marks (`mark="x"`), `cols={2}`. |
| `Stat` | Big number + label. |
| `Testimonial` | Quote card: `name`, `role`, `image`; slot is the quote. |
| `FaqList` | Accordion from the FAQs collection: `<FaqList group="pricing" />`. |
| `CtaBand` | Closing call to action panel (inside a `Section`). |
| `Form` + `Field` | Static form card with consent checkboxes. Forms post nowhere yet (`action="#"`). |
| `Prose` | Long-form text (blog, legal). |
| `SchoolLogos`, `StudentProjects` | Shared blocks — the same everywhere they appear. |
| `Nav`, `Footer`, `Logo` | Site chrome; edit the menu/column lists at the top of each file. |

## Styleguide
`/styleguide` (`src/pages/styleguide.astro`) shows every token and component with live examples, and for each component how many times it's placed, on which pages, which components contain it, and every page a change affects. The counts come from `src/lib/usage.ts`, which reads the source at build time — add new components there with a `<StyleguideEntry name="…">`.

## Content collections (`src/content/`, schema in `src/content.config.ts`)
- `faqs/<group>/*.md` — question in frontmatter, answer in the body. Groups: general, getting-started, lovable, imagicharm, data-privacy, troubleshooting, pricing-plans (FAQ page), pricing, safety, ambassadors.
- `posts/*.md` + `authors/*.md` — blog (`/blog`, `/blog/<slug>`, `/blog/author/<author>`).
- `press/*.md` — press coverage cards on `/press`.
- `legal/*.md` — Privacy, Terms of Service, Cookie Policy, Terms of Sale (rendered by `src/pages/[legal].astro`).

## Images
`public/images/<page>/` — imagery from the live site. Shared: `public/images/schools/` (school logos), `public/images/projects/` (student projects). Brand assets and the Pangea **trial** font are in `public/brand/` and `public/fonts/` (swap in the licensed font before launch).

## Known gaps
- Forms are static — connect them to HubSpot (or another endpoint) before launch.
- Some photos still show the old purple branding.
