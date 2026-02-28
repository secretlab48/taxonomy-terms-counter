<?php
/**
 * Classic editor term counts.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_terms_checklist_args', 'ttcounter_filter_terms_checklist_args', 10, 2 );
add_action( 'admin_enqueue_scripts', 'ttcounter_enqueue_classic_flat_counts' );

/**
 * Inject custom walker with term counts for classic editor checklists.
 *
 * @param array $args Checklist args.
 * @param int   $post_id Current post ID.
 * @return array
 */
function ttcounter_filter_terms_checklist_args( $args, $post_id ) {
	if ( empty( $args['taxonomy'] ) ) {
		return $args;
	}

	$taxonomy = $args['taxonomy'];

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || ! isset( $screen->post_type ) ) {
		return $args;
	}

	$post_type = $screen->post_type;

	$options = get_option( 'taxonomy-terms-counter', array( 'taxs' => array() ) );
	$taxs    = isset( $options['taxs'][ $post_type ][ $taxonomy ] ) ? $options['taxs'][ $post_type ][ $taxonomy ] : null;

	if ( ! $taxs || empty( $taxs['show_count'] ) ) {
		return $args;
	}

	$counts = ttcounter_get_term_counts_for_taxonomy( $post_type, $taxonomy );

	$args['walker'] = new TTCounter_Walker_Term_Checklist( $taxonomy, $counts );

	return $args;
}

/**
 * Get term counts for one taxonomy.
 *
 * @param string $post_type Post type.
 * @param string $taxonomy Taxonomy.
 * @return array
 */
function ttcounter_get_term_counts_for_taxonomy( $post_type, $taxonomy ) {
	$terms = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
		)
	);

	if ( is_wp_error( $terms ) ) {
		return array();
	}

	$counts = array();

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

		$counts[ $term->term_id ] = $count;
	}

	return $counts;
}

/**
 * Enqueue classic editor flat taxonomy counts script.
 *
 * @param string $hook Current admin page hook.
 */
function ttcounter_enqueue_classic_flat_counts( $hook ) {
	if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
		return;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || ! isset( $screen->post_type ) ) {
		return;
	}

	if ( function_exists( 'use_block_editor_for_post_type' ) && use_block_editor_for_post_type( $screen->post_type ) ) {
		return;
	}

	$options = get_option( 'taxonomy-terms-counter', array( 'taxs' => array() ) );
	$taxs    = isset( $options['taxs'][ $screen->post_type ] ) ? $options['taxs'][ $screen->post_type ] : array();

	$counts      = array();
	$active_taxs = array();

	foreach ( $taxs as $taxonomy => $settings ) {
		if ( empty( $settings['show_count'] ) ) {
			continue;
		}

		if ( is_taxonomy_hierarchical( $taxonomy ) ) {
			continue;
		}

		$active_taxs[] = $taxonomy;

		$term_counts = ttcounter_get_term_counts_for_taxonomy( $screen->post_type, $taxonomy );
		$terms       = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
			)
		);

		if ( is_wp_error( $terms ) ) {
			continue;
		}

		foreach ( $terms as $term ) {
			$count = isset( $term_counts[ $term->term_id ] )
				? (int) $term_counts[ $term->term_id ]
				: 0;
			$label = apply_filters(
				'ttcounter_classic_flat_term_label',
				$term->name,
				$term,
				$taxonomy,
				$screen->post_type,
				$count
			);
			$counts[ $taxonomy ][ $label ] = $count;
		}
	}

	if ( empty( $active_taxs ) ) {
		return;
	}

	wp_enqueue_script(
		'ttcounter-classic-flat-counts',
		TTCOUNTER_URL . 'assets/build/classic-flat-counts.js',
		array(),
		'1.0.0',
		true
	);

	wp_localize_script(
		'ttcounter-classic-flat-counts',
		'TTCounterClassic',
		array(
			'taxonomies' => $active_taxs,
			'counts'     => $counts,
		)
	);
}
