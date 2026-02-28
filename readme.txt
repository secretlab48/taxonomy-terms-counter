=== Taxonomy Terms Counter ===
Contributors: secretlab48
Donate link: https://www.privat24.ua/send/iqtg5
Tags: Tags: gutenberg, taxonomy, terms, count, editor, sidebar
Requires at least: 6.8
Tested up to: 6.9
Stable tag: 2.0.0
Requires PHP: 7.4
License: GPLv2
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

Show taxonomy term counts in the editor sidebar and manage which taxonomies display counts.

== Description ==
Taxonomy Terms Counter adds term counts to taxonomy panels in the editor sidebar for both Gutenberg and Classic Editor.
You can enable or disable counts per taxonomy and post type from the plugin settings page.

== Source Code ==
Full source code is available on GitHub:
https://github.com/secretlab48/taxonomy-terms-counter

Notes:
- The settings page lists taxonomies that are available in REST for the selected post type.
- The plugin works on admin post screens for both Gutenberg and Classic Editor.
- If an existing post type is missing on the settings page, it likely has `show_in_rest` set to `false`.
- If a taxonomy is missing for a post type, it likely has `show_in_rest` set to `false`.

== Hooks ==
The plugin provides the following hooks for customization:

= PHP Filters =
* `ttcounter_term_count_taxonomies` — Filter taxonomies list for term counts. Args: `$taxonomies`, `$post_type`, `$request`.
* `ttcounter_term_count_get_terms_args` — Filter `get_terms()` args. Args: `$args`, `$taxonomy`, `$post_type`.
* `ttcounter_term_count_value` — Filter count value per term. Args: `$count`, `$term`, `$taxonomy`, `$post_type`.
* `ttcounter_term_counts_response` — Filter REST response. Args: `$results`, `$post_type`, `$taxonomies`.
* `ttcounter_sanitized_settings` — Filter sanitized settings before save. Args: `$sanitized_taxs`, `$request`.
* `ttcounter_classic_hierarchical_label` — Filter classic editor hierarchical label text. Args: `$label`, `$term`, `$taxonomy`, `$post_type`, `$count`.
* `ttcounter_classic_hierarchical_item_html` — Filter classic editor hierarchical item HTML. Args: `$item_output`, `$term`, `$taxonomy`, `$post_type`, `$count`.
* `ttcounter_classic_flat_term_label` — Filter classic editor flat term label key. Args: `$label`, `$term`, `$taxonomy`, `$post_type`, `$count`.

= PHP Actions =
* `ttcounter_settings_updated` — Fires after settings are saved. Args: `$sanitized_taxs`, `$request`.

= JS Filters =
* `ttcounter.termCountTaxonomies` — Filter taxonomy list before REST request. Args: `taxonomies`, `postType`.
* `ttcounter.termCountData` — Filter REST response data before rendering. Args: `data`, `postType`.
* `ttcounter.restrictedPostTypes` — Filter restricted post types list in settings. Args: `restrictedPostTypes`.
* `ttcounter.restrictedTaxonomies` — Filter restricted taxonomies list in settings. Args: `restrictedTaxonomies`.
* `ttcounter.termCountLabel` — Filter sidebar label text. Args: `value`, `{ name, count, label }`.
* `window.TTCounterClassicFilterLabel` — Filter classic editor flat checklist label text. Args: `{ taxonomy, name, count, label }`.

= JS Actions =
* `ttcounter.sidebarUpdated` — Fires after sidebar counts update. Args: `termsByTax`.

== Installation ==
1. Upload the plugin to your `/wp-content/plugins/` directory.
2. Activate the plugin through the “Plugins” menu in WordPress.
3. Go to “Taxonomy Counter” to configure which taxonomies show counts.

== Frequently Asked Questions ==
= Does it work with custom taxonomies? =
Yes, any taxonomy that is exposed to REST and enabled in settings.

= Does it work with custom post types? =
Yes. Enable per taxonomy in the settings page.

= Does it work with the Classic Editor? =
Yes. The plugin works with both Gutenberg and Classic Editor.

== Screenshots ==
1. Settings page for enabling counts per taxonomy.
2. Counts displayed in the Gutenberg taxonomy panel.

== Changelog ==
= 2.0.0 =
* Added Classic Editor support for both hierarchical and non-hierarchical taxonomies.
* Added Classic Editor hooks for hierarchical and flat taxonomies.
* Added Gutenberg support for non-hierarchical taxonomies.

= 1.0.0 =
* Initial release.

== Upgrade Notice ==
= 1.0.0 =
Initial release.
