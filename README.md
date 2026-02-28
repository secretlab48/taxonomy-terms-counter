# Taxonomy Terms Counter — Project Context

## Purpose
WordPress plugin that shows per-term post counts in the editor sidebar for both Gutenberg and Classic Editor, and provides an admin settings page to enable/disable counts per taxonomy and post type.

## Runtime Flow (High Level)
1. Admin selects which taxonomies should show counts for each post type.
2. Editor screen loads the sidebar plugin, fetches term counts via REST, and injects counts into taxonomy panels.
3. When a post is saved/updated, counts are refetched and the sidebar is updated.

## Entry Points
- `taxonomy-terms-counter.php`: plugin bootstrap, defines `TTCOUNTER_PATH`/`TTCOUNTER_URL`, includes PHP modules.

## PHP Modules
- `includes/rest-term-counts.php`
  - Registers `POST /ttcounter/v1/term-counts`.
  - Returns term counts for requested taxonomies and post type (published posts only).
- `includes/rest-api.php`
  - Registers `GET/POST /ttcounter/v1/settings` for admin options.
- `includes/admin-page.php`
  - Adds admin menu page and enqueues `assets/build/admin.js` + `admin.css`.
- `includes/single-post-page.php`
  - Enqueues editor script `assets/build/taxonomy-terms-counter.js`.
  - Passes active taxonomies to JS in `TTCounter.data`.
- `includes/classic-editor.php`
  - Adds term counts for Classic Editor.
  - Enqueues classic flat taxonomy updater and passes counts to JS.

## JS App (Admin Settings)
- `src/index.jsx`
  - React UI for selecting taxonomies per post type.
  - Fetches post types, taxonomies, and settings; saves settings via REST.
- `src/store.js`
  - Zustand store for active post type and taxonomy settings.
- `src/style.scss`
  - Styling for the admin settings page.

## JS App (Editor Sidebar Counts)
- `src/taxonomy-terms-counter.jsx`
  - Gutenberg plugin entry; uses hooks to fetch counts and update sidebar.
- `src/admin-single-post/useTermCounts.js`
  - Fetches counts using `POST /ttcounter/v1/term-counts`.
  - Refetches after successful post save (observes notices).
- `src/admin-single-post/updateTermsInSidebar.js`
  - Finds taxonomy panels and injects counts into label text.
  - Matches panels to taxonomies by comparing term names.
- `src/admin-single-post/useSidebarObserver.js`
  - MutationObserver for sidebar changes (roll/unroll, dynamic rendering).

## Build
- `webpack.config.js`
  - Bundles `admin` and `taxonomy-terms-counter` into `assets/build/`.
- `package.json`
  - Scripts: `npm run build`, `npm run dev`.
  - Uses `zustand`, Babel, Webpack, Sass.

## Local Development
1. Clone the repository:
   - The repository does not include a wrapper directory named `taxonomy-terms-counter`. Create it yourself, or run this command from `/wp-content/plugins`:
   - `git clone https://github.com/secretlab48/taxonomy-terms-counter.git taxonomy-terms-counter`
2. Install dependencies:
   - `npm install`
3. Build assets:
   - `npm run build`
4. Watch assets during development:
   - `npm run dev`

## Notes
- Term counts are computed server-side with a SQL query per term, respecting on current post_type.
- Editor script relies on `TTCounter.data` (active taxonomies) and REST nonce.

## Hooks
### PHP Filters
- `ttcounter_term_count_taxonomies` — Filter taxonomies list for term counts. Args: `$taxonomies`, `$post_type`, `$request`.
- `ttcounter_term_count_get_terms_args` — Filter `get_terms()` args. Args: `$args`, `$taxonomy`, `$post_type`.
- `ttcounter_term_count_value` — Filter count value per term. Args: `$count`, `$term`, `$taxonomy`, `$post_type`.
- `ttcounter_term_counts_response` — Filter REST response. Args: `$results`, `$post_type`, `$taxonomies`.
- `ttcounter_sanitized_settings` — Filter sanitized settings before save. Args: `$sanitized_taxs`, `$request`.
- `ttcounter_classic_hierarchical_label` — Filter classic editor hierarchical label text. Args: `$label`, `$term`, `$taxonomy`, `$post_type`, `$count`.
- `ttcounter_classic_hierarchical_item_html` — Filter classic editor hierarchical item HTML. Args: `$item_output`, `$term`, `$taxonomy`, `$post_type`, `$count`.
- `ttcounter_classic_flat_term_label` — Filter classic editor flat term label key. Args: `$label`, `$term`, `$taxonomy`, `$post_type`, `$count`.

### PHP Actions
- `ttcounter_settings_updated` — Fires after settings are saved. Args: `$sanitized_taxs`, `$request`.

### JS Filters
- `ttcounter.termCountTaxonomies` — Filter taxonomy list before REST request. Args: `taxonomies`, `postType`.
- `ttcounter.termCountData` — Filter REST response data before rendering. Args: `data`, `postType`.
- `ttcounter.restrictedPostTypes` — Filter restricted post types list in settings. Args: `restrictedPostTypes`.
- `ttcounter.restrictedTaxonomies` — Filter restricted taxonomies list in settings. Args: `restrictedTaxonomies`.
- `ttcounter.termCountLabel` — Filter sidebar label text. Args: `value`, `{ name, count, label }`.
- `window.TTCounterClassicFilterLabel` — Filter classic editor flat checklist label text. Args: `{ taxonomy, name, count, label }`.

### JS Actions
- `ttcounter.sidebarUpdated` — Fires after sidebar counts update. Args: `termsByTax`.

## Changelog
### 2.0.0
- Added Classic Editor support for both hierarchical and non-hierarchical taxonomies.
- Added Classic Editor hooks for hierarchical and flat taxonomies.
- Added Gutenberg support for non-hierarchical taxonomies.

### 1.0.0
- Initial release.
