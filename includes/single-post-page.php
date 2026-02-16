<?php
/**
 * Editor assets for single post screens.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_enqueue_scripts', 'ttcounter_enqueue_single_post_admin_assets' );

/**
 * Enqueue editor assets for post screens.
 */
function ttcounter_enqueue_single_post_admin_assets() {
	$screen = get_current_screen();

	if ( ! $screen ) {
		return;
	}

	if ( ! in_array( $screen->base, array( 'post', 'post-new' ), true ) ) {
		return;
	}

	if ( function_exists( 'use_block_editor_for_post_type' ) && ! use_block_editor_for_post_type( $screen->post_type ) ) {
		return;
	}

	wp_enqueue_script(
		'ttcounter-single-post-admin-js',
		TTCOUNTER_URL . 'assets/build/taxonomy-terms-counter.js',
		array( 'wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-hooks' ),
		'1.0.0',
		true
	);

	if ( function_exists( 'wp_set_script_translations' ) ) {
		wp_set_script_translations(
			'ttcounter-single-post-admin-js',
			'taxonomy-terms-counter',
			TTCOUNTER_PATH . 'languages'
		);
	}

	$tax_options = get_option( 'taxonomy-terms-counter', array() );
	$tax_options = isset( $tax_options['taxs'] ) ? $tax_options['taxs'] : array();
	$active_taxs = array();

	if ( isset( $tax_options[ $screen->post_type ] ) ) {
		$tax_options = $tax_options[ $screen->post_type ];
	} else {
		$tax_options = array();
	}

	foreach ( $tax_options as $tax_option => $option_value ) {
		if ( ! empty( $option_value['show_count'] ) ) {
			$active_taxs[] = $tax_option;
		}
	}

	wp_localize_script(
		'ttcounter-single-post-admin-js',
		'TTCounter',
		array(
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'data'  => $active_taxs,
		)
	);

	wp_enqueue_style(
		'ttcounter-admin-css',
		TTCOUNTER_URL . 'assets/build/admin.css',
		array(),
		'1.0.0'
	);
}
