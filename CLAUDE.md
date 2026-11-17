# imagi website — Astro + Stacki

Rebuild of imagilabs.com in the new imagi brand, from the Figma file **[INT] - Imagi Website Internal** (Pages (new brand) + the design system).
Run with `npm run dev` (Astro 7 runs the dev server in the background on http://localhost:4322 if 4321 is taken; `npx astro dev stop` to stop it).

## Working alongside Stacki
This project is edited visually in Stacki *and* by Claude. Stacki autosaves to the source files ~300ms after each edit.

- **Take turns on files.** Don't edit a file Claude is changing (or vice versa) — Stacki's autosave can overwrite it.
- **Commit in Stacki (⌥H) before handing work to Claude**, so there's a checkpoint to diff/roll back.
- **Claude does not run branch, stash, checkout, reset or merge commands** — Stacki owns git operations. Claude may only commit when asked.
- **Keep markup Stacki-editable:** page copy lives as plain text in `src/pages/*.astro`. Layout (sections, headings, splits, grids) is plain HTML with global classes; only reusable UI (buttons, cards, logo grids, CTA panels, accordions, forms) are components. Don't use `.map()` loops or computed expressions in page templates — lists that repeat (FAQs, posts, press) come from content collections and are looped inside components.
- **One class, one rule (CSS kept flat for Stacki).** Every styled element gets its own class, and each CSS rule targets exactly one class. No grouped selectors (`.a, .b`), no nested/descendant selectors (`.a .b`, `.a img`), no parent-state variants — use a modifier class on the element itself (`hero_text--left`, `split_media--first`, `checklist_item--x`). A class's responsive change sits right under it, one class per `@media` block. Only exceptions: the base element reset and `.prose` (styles Markdown). Applies to `global.css`, page `<style>` blocks and component styles.
- **Home hero is its own block** (`.homehero*` classes), not `.hero`, so editing it never changes other pages' heroes.
- Stacki reads `src/content.config.ts` with esbuild — keep `esbuild` in devDependencies. New collections need a dev-server restart.

## Preview hosting
Public preview: https://joshofcourse.github.io/imagi-website/ (repo `joshofcourse/imagi-website`). Every push to `main` rebuilds it via `.github/workflows/deploy.yml` (~1 min). That build sets `SITE_BASE` so links work under the `/imagi-website/` sub-path, and `PUBLIC_NOINDEX` so search engines skip it — neither applies to local dev. Keep links root-relative (`/pricing`, `/images/…`); the build prefixes them.

## Design rules (keep it consistent)
- **Tokens only.** Colours, spacing, radius, shadows and type sizes come from `src/styles/global.css` (mirrors the Figma Brand / Tokens / Theme variables). Never hard-code a hex value or pixel spacing in a page.
- **Layout spacing tokens:** `--section-padding`, `--section-padding-tight`, `--hero-padding-top`, `--section-gap`, `--content-gap`, `--grid-gap`, `--split-gap`, `--card-padding`. They point at the `--space-*` scale; change one to respace every section, grid or card at once.
- **Type:** one `h1` per page (in the hero, Display L). Section headings are Display S (`.section-header`). Card titles are Heading M. Body copy Body M/L. There are no label styles: buttons, badges, nav and form labels use Body in Medium (`.text-body-s-medium` etc.). Body comes in XL 23 / L 21 / M 19 / S 17 / XS 15 / 2XS 13, Regular or Medium, line height 1.3. Use the `.text-*` classes, which match the 18 Figma text styles.
- **Sections:** every band on a page is `<section class="section section--<tone>"><div class="section_inner">` — same vertical padding everywhere. Alternate tones to separate sections: `page` (white) / `subtle` (cream) / `muted` (sand). `dark` (forest) is for rare emphasis; the closing CTA uses `CtaBand`.
- **Shapes:** cards and images use radius lg (32px); inputs and badges radius sm (8px); buttons are pills. No strokes on cards, soft Forest-tinted shadows only.
- **No floating decoration.** No stray shapes, tape strips, wavy dividers, dots or loose icons. Keep real imagery (photos, product screenshots, logos). Icons only inside `IconDisc` or next to text.
- **Buttons:** primary (Forest) for the main action, outline for the secondary one, `secondary` (Zest) on dark backgrounds.

## Components (`src/components/`)
| Component | Use |
|---|---|
| `Card` | The only card. `title`, `tone`, `image`, `icon` + `iconTone`, `eyebrow`, `band` (coloured header), `href` + `linkLabel`. Slots: default, `tags`, `footer`. |
| `Badge` | Pill label. `tone` brand / neutral / dark / accent / outline, `size` s/m. |
| `Button` | Pill button. `variant` primary / secondary / outline / inverse, `size` s/m/l, `arrow`, `external`. |
| `IconDisc` + `Icon` | Icon tile / bare line icon. Icon names are listed in `Icon.astro`. |
| `Testimonial` | Quote card: `name`, `role`, `image`; slot is the quote. |
| `FaqList` | Accordion from the FAQs collection: `<FaqList group="pricing" />`. |
| `CtaBand` | Closing call to action panel (inside a `.section`). |
| `Form` + `Field` | Static form card with consent checkboxes. Forms post nowhere yet (`action="#"`). `Field` types: text, email, tel, number, textarea, select, checkboxes. |
| `SchoolLogos`, `StudentProjects` | Shared blocks — the same everywhere they appear. |
| `AppMockup` | Browser window of student-built apps (home hero). Its 5 scenes cycle in step with the `data-words` span in the same section — keep the word order and scene order matched. |
| `Nav`, `Footer`, `Logo` | Site chrome; edit the menu/column lists at the top of each file. |

## Styleguide
`/styleguide` (`src/pages/styleguide.astro`) shows every token and component with live examples, and for each component how many times it's placed, on which pages, which components contain it, and every page a change affects. The counts come from `src/lib/usage.ts`, which reads the source at build time — add new components there with a `<StyleguideEntry name="…">`.

## Layout classes (`src/styles/global.css`)
Plain HTML, no component needed:
- `section.section.section--{page|subtle|muted|brand-soft|dark}` (+ `section--tight`) > `div.section_inner` (+ `section_inner--narrow`)
- `section.hero.hero--{tone}` > `div.hero_inner` > `div.hero_text` (`Badge`, `h1.text-display-l`, `.hero_lead`, `.hero_meta`, `.hero_actions`). Image beside text: `hero_inner--split`, `div.hero_media > img.hero_image`, and `hero_text--left` / `hero_meta--left` / `hero_actions--left`
- `section.homehero` — home page only (`homehero_card`, `homehero_art*`, `homehero_text`, `homehero_mockup` around `AppMockup`)
- `header.section-header` (+ `section-header--left`): `Badge`, `h2.text-display-s`, `.section-header_intro`
- `div.split` > `.split_text` + `.split_media > img.split_image` (`split_media--first` puts the image on the left)
- `div.grid.grid--{2|3|4}`, `ul.checklist > li.checklist_item` (+ `checklist_item--x`, list `checklist--cols-2`), `div.stat` (`.stat_value`, `.stat_label`, `.stat_note`), `div.prose`, `div.formlayout` (`.formlayout_aside`, `.formlayout_main`)

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
