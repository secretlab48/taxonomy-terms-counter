<?php
/**
 * Term counts REST API endpoint.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'ttcounter_register_term_counts_route' );

/**
 * Register term counts REST route.
 */
function ttcounter_register_term_counts_route() {
	register_rest_route(
		'ttcounter/v1',
		'/term-counts',
		array(
			'methods'             => 'POST',
			'callback'            => 'ttcounter_get_term_counts',
			'permission_callback' => 'ttcounter_can_edit_posts',
			'args'                => array(
				'post_type'  => array(
					'required' => true,
					'type'     => 'string',
				),
				'taxonomies' => array(
					'required' => true,
					'type'     => 'array',
					'items'    => array(
						'type' => 'string',
					),
				),
			),
		)
	);
}

/**
 * Check REST permissions for term counts route.
 *
 * @return bool
 */
function ttcounter_can_edit_posts() {
	return current_user_can( 'edit_posts' );
}

/**
 * Get term counts for the requested taxonomies.
 *
 * @param WP_REST_Request $request REST request.
 * @return array
 */
function ttcounter_get_term_counts( WP_REST_Request $request ) {
	global $wpdb;

	$post_type  = sanitize_key( $request['post_type'] );
	$taxonomies = array_map( 'sanitize_key', (array) $request['taxonomies'] );
	$taxonomies = apply_filters( 'ttcounter_term_count_taxonomies', $taxonomies, $post_type, $request );

	if ( empty( $taxonomies ) ) {
		return array();
	}

	$results = array();

	foreach ( $taxonomies as $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			continue;
		}

		$terms = get_terms(
			apply_filters(
				'ttcounter_term_count_get_terms_args',
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
				),
				$taxonomy,
				$post_type
			)
		);

		if ( is_wp_error( $terms ) ) {
			continue;
		}

		foreach ( $terms as $term ) {
			$cache_key = sprintf(
				'term_count_%s_%s_%d',
				$post_type,
				$taxonomy,
				$term->term_id
			);
			$count     = wp_cache_get( $cache_key, 'ttcounter' );

			if ( false === $count ) {
				$query = new WP_Query(
					array(
						'post_type'              => $post_type,
						'post_status'            => 'publish',
						'posts_per_page'         => 1,
						'fields'                 => 'ids',
						'no_found_rows'          => false,
						'update_post_meta_cache' => false,
						'update_post_term_cache' => false,
						'tax_query'              => array(
							array(
								'taxonomy' => $taxonomy,
								'field'    => 'term_id',
								'terms'    => array( $term->term_id ),
							),
						),
					)
				);

				$count = (int) $query->found_posts;
				wp_cache_set( $cache_key, $count, 'ttcounter' );
			}

			$count = apply_filters( 'ttcounter_term_count_value', $count, $term, $taxonomy, $post_type );

			$results[ $taxonomy ][ $term->term_id ] = array(
				'term_id' => $term->term_id,
				'name'    => $term->name,
				'slug'    => $term->slug,
				'count'   => $count,
			);
		}
	}

	return apply_filters( 'ttcounter_term_counts_response', $results, $post_type, $taxonomies );
}
