# Taxonomy Terms Counter — Project Context

## Purpose
WordPress plugin that shows per-term post counts in the Gutenberg editor sidebar and provides an admin settings page to enable/disable counts per taxonomy and post type.

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
