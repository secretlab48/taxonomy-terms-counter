<?php
/**
 * Settings REST API endpoints.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'ttcounter_register_settings_routes' );

/**
 * Register settings REST routes.
 */
function ttcounter_register_settings_routes() {
	register_rest_route(
		'ttcounter/v1',
		'/settings',
		array(
			'methods'             => 'GET',
			'callback'            => 'ttcounter_get_settings',
			'permission_callback' => 'ttcounter_can_manage_options',
		)
	);

	register_rest_route(
		'ttcounter/v1',
		'/settings',
		array(
			'methods'             => 'POST',
			'callback'            => 'ttcounter_save_settings',
			'permission_callback' => 'ttcounter_can_manage_options',
		)
	);
}

/**
 * Check REST permissions for settings routes.
 *
 * @return bool
 */
function ttcounter_can_manage_options() {
	return current_user_can( 'manage_options' );
}

/**
 * Get plugin settings.
 *
 * @return array
 */
function ttcounter_get_settings() {
	return get_option( 'taxonomy-terms-counter', array( 'taxs' => array() ) );
}

/**
 * Save plugin settings.
 *
 * @param WP_REST_Request $request REST request.
 * @return array|WP_Error
 */
function ttcounter_save_settings( WP_REST_Request $request ) {
	$data = $request->get_json_params();

	if ( ! isset( $data['taxs'] ) || ! is_array( $data['taxs'] ) ) {
		return new WP_Error(
			'invalid',
			__( 'Invalid payload', 'taxonomy-terms-counter' ),
			array( 'status' => 400 )
		);
	}

	$sanitized_taxs = array();

	foreach ( $data['taxs'] as $post_type => $tax_settings ) {
		$post_type = sanitize_key( $post_type );

		if ( ! post_type_exists( $post_type ) ) {
			continue;
		}

		if ( ! is_array( $tax_settings ) ) {
			continue;
		}

		foreach ( $tax_settings as $taxonomy => $settings ) {
			$taxonomy = sanitize_key( $taxonomy );

			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			$show_count = false;
			if ( is_array( $settings ) && isset( $settings['show_count'] ) ) {
				$show_count = (bool) $settings['show_count'];
			}

			$sanitized_taxs[ $post_type ][ $taxonomy ] = array(
				'show_count' => $show_count,
			);
		}
	}

	$sanitized_taxs = apply_filters( 'ttcounter_sanitized_settings', $sanitized_taxs, $request );

	update_option(
		'taxonomy-terms-counter',
		array(
			'taxs' => $sanitized_taxs,
		),
		false
	);

	do_action( 'ttcounter_settings_updated', $sanitized_taxs, $request );

	return array( 'status' => 'ok' );
}
