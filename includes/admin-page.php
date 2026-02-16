<?php
/**
 * Admin settings page.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_menu', 'ttcounter_register_admin_page' );

/**
 * Register the admin menu page.
 */
function ttcounter_register_admin_page() {
	add_menu_page(
		__( 'Taxonomy Terms Counter', 'taxonomy-terms-counter' ),
		__( 'Taxonomy Terms Counter', 'taxonomy-terms-counter' ),
		'manage_options',
		'taxonomy-terms-counter',
		'ttcounter_render_admin_page',
		'dashicons-list-view',
		65
	);
}

/**
 * Render the admin settings page.
 */
function ttcounter_render_admin_page() {
	echo '<div class="wrap">';
	echo '<h1>' . esc_html__( 'Taxonomy Terms Counter Settings', 'taxonomy-terms-counter' ) . '</h1>';
	echo '<div id="ttcounter-admin-root"></div>';
	echo '</div>';
}

add_action( 'admin_enqueue_scripts', 'ttcounter_enqueue_admin_assets' );

/**
 * Enqueue admin assets for the plugin settings page.
 *
 * @param string $hook Current admin page hook.
 */
function ttcounter_enqueue_admin_assets( $hook ) {
	if ( 'toplevel_page_taxonomy-terms-counter' !== $hook ) {
		return;
	}

	wp_enqueue_script(
		'ttcounter-admin-js',
		TTCOUNTER_URL . 'assets/build/admin.js',
		array( 'wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-hooks' ),
		'1.0.0',
		true
	);

	if ( function_exists( 'wp_set_script_translations' ) ) {
		wp_set_script_translations(
			'ttcounter-admin-js',
			'taxonomy-terms-counter',
			TTCOUNTER_PATH . 'languages'
		);
	}

	wp_localize_script(
		'ttcounter-admin-js',
		'TTCounter',
		array(
			'nonce' => wp_create_nonce( 'wp_rest' ),
		)
	);

	wp_enqueue_style(
		'ttcounter-admin-css',
		TTCOUNTER_URL . 'assets/build/admin.css',
		array(),
		'1.0.0'
	);
}
