<?php
/**
 * Plugin Name: Taxonomy Terms Counter
 * Description: Show taxonomy term counts in the Gutenberg editor sidebar and manage which taxonomies display counts.
 * Version: 2.0.0
 * Author: secretlab48
 * License: GPLv2
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain: taxonomy-terms-counter
 * Domain Path: /languages
 *
 * @package TaxonomyTermsCounter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'TTCOUNTER_PATH', plugin_dir_path( __FILE__ ) );
define( 'TTCOUNTER_URL', plugin_dir_url( __FILE__ ) );

require_once TTCOUNTER_PATH . 'includes/rest-term-counts.php';
require_once TTCOUNTER_PATH . 'includes/admin-page.php';
require_once TTCOUNTER_PATH . 'includes/single-post-page.php';
require_once TTCOUNTER_PATH . 'includes/rest-api.php';
require_once TTCOUNTER_PATH . 'includes/class-ttcounter-walker-term-checklist.php';
require_once TTCOUNTER_PATH . 'includes/classic-editor.php';

register_activation_hook( __FILE__, 'ttcounter_set_activation_redirect' );

/**
 * Set a flag to redirect to the settings page on first admin load.
 */
function ttcounter_set_activation_redirect() {
	add_option( 'ttcounter_do_activation_redirect', 1 );
}

add_action( 'admin_init', 'ttcounter_do_activation_redirect' );

/**
 * Redirect to the plugin settings page after activation.
 */
function ttcounter_do_activation_redirect() {
	if ( ! is_admin() ) {
		return;
	}

	if ( ! get_option( 'ttcounter_do_activation_redirect' ) ) {
		return;
	}

	delete_option( 'ttcounter_do_activation_redirect' );

	if ( is_network_admin() || wp_doing_ajax() ) {
		return;
	}

	wp_safe_redirect( admin_url( 'admin.php?page=taxonomy-terms-counter' ) );
	exit;
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'ttcounter_add_settings_link' );

/**
 * Add a Settings link on the plugins page.
 *
 * @param array $links Plugin action links.
 * @return array
 */
function ttcounter_add_settings_link( $links ) {
	$settings_link = sprintf(
		'<a href="%s">%s</a>',
		esc_url( admin_url( 'admin.php?page=taxonomy-terms-counter' ) ),
		esc_html__( 'Settings', 'taxonomy-terms-counter' )
	);

	array_unshift( $links, $settings_link );

	return $links;
}
