<?php
/**
 * Term checklist walker with counts.
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Walker_Category_Checklist' ) ) {
	require_once ABSPATH . 'wp-admin/includes/template.php';
}

class TTCounter_Walker_Term_Checklist extends Walker_Category_Checklist {
	private $taxonomy;
	private $counts;

	public function __construct( $taxonomy, $counts ) {
		$this->taxonomy = $taxonomy;
		$this->counts   = $counts;
	}

	public function start_el( &$output, $term, $depth = 0, $args = array(), $id = 0 ) {
		if ( empty( $args['taxonomy'] ) ) {
			$args['taxonomy'] = $this->taxonomy;
		}

		$item_output = '';
		parent::start_el( $item_output, $term, $depth, $args, $id );

		$count     = isset( $this->counts[ $term->term_id ] ) ? (int) $this->counts[ $term->term_id ] : 0;
		$label     = $term->name . ' (' . $count . ')';
		$label     = apply_filters(
			'ttcounter_classic_hierarchical_label',
			$label,
			$term,
			$this->taxonomy,
			$args['post_type'] ?? null,
			$count
		);

		$label_close = strrpos( $item_output, '</label>' );
		if ( false !== $label_close ) {
			$insert = ' ' . $label;
			$item_output = substr_replace( $item_output, $insert, $label_close, 0 );
		} else {
			$label_close = strrpos( $item_output, '</div>' );
			if ( false !== $label_close ) {
				$insert = ' ' . $label;
				$item_output = substr_replace( $item_output, $insert, $label_close, 0 );
			}
		}

		$item_output = apply_filters(
			'ttcounter_classic_hierarchical_item_html',
			$item_output,
			$term,
			$this->taxonomy,
			$args['post_type'] ?? null,
			$count
		);

		$output .= $item_output;
	}
}
