/* global TTCounter */

import { createRoot, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { useTtcounterStore } from './store';
import './style.scss';

apiFetch.use( apiFetch.createNonceMiddleware( TTCounter.nonce ) );

function TtcounterApp() {
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveResult, setSaveResult ] = useState( null );
	const [ postTypes, setPostTypes ] = useState( [] );
	const [ taxonomies, setTaxonomies ] = useState( [] );

	const {
		activePostType,
		setActivePostType,
		taxonomySettings,
		setTaxonomySetting,
		isDirty,
		setInitialSettings,
	} = useTtcounterStore();

	useEffect( () => {
		apiFetch( { path: '/wp/v2/types?context=edit' } ).then( ( data ) => {
			const restrictedPostTypes = [
				'page',
				'attachment',
				'nav_menu_item',
				'wp_block',
				'wp_template',
				'wp_template_part',
				'wp_global_styles',
				'wp_navigation',
				'wp_font_family',
				'wp_font_face',
			];
			const filteredRestrictedPostTypes = applyFilters(
				'ttcounter.restrictedPostTypes',
				restrictedPostTypes
			);
			const list = Object.keys( data );
			setPostTypes(
				list.filter( function ( postType ) {
					return ! filteredRestrictedPostTypes.includes( postType );
				} )
			);

			const params = new URLSearchParams( window.location.search );
			const fromUrl = params.get( 'post-type' );

			if ( fromUrl && list.includes( fromUrl ) ) {
				setActivePostType( fromUrl );
			} else {
				setActivePostType( list[ 0 ] );
			}
		} );

		apiFetch( { path: '/wp/v2/taxonomies?context=edit' } ).then(
			( data ) => {
				const restrictedTaxonomies = applyFilters(
					'ttcounter.restrictedTaxonomies',
					[]
				);
				setTaxonomies(
					Object.values( data ).filter(
						( t ) => ! restrictedTaxonomies.includes( t.slug )
					)
				);
			}
		);

		apiFetch( { path: '/ttcounter/v1/settings' } ).then( ( data ) => {
			setInitialSettings( data.taxs || {} );
		} );
	}, [] );

	const save = async () => {
		if ( isSaving ) {
			return;
		}

		setIsSaving( true );
		setSaveResult( null );

		try {
			await apiFetch( {
				path: '/ttcounter/v1/settings',
				method: 'POST',
				data: { taxs: taxonomySettings },
			} );

			setSaveResult( 'success' );
		} catch ( e ) {
			setSaveResult( 'error' );
		} finally {
			setIsSaving( false );

			setTimeout( () => {
				setSaveResult( null );
			}, 5000 );
		}
	};

		return (
		<div className="ttcounter-layout">
			<aside className="ttcounter-sidebar">
				<h2 className="ttcounter-sidebar-title">
					{ __( 'Post types', 'taxonomy-terms-counter' ) }
				</h2>
				{ postTypes.map( ( pt ) => (
					<div
						key={ pt }
						role="button"
						tabIndex={ 0 }
						className={ pt === activePostType ? 'active' : '' }
						onClick={ () => {
							const url = new URL( window.location.href );
							url.searchParams.set( 'post-type', pt );
							window.history.replaceState( null, '', url );
							setSaveResult( null );
							setActivePostType( pt );
						} }
						onKeyDown={ ( event ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								event.preventDefault();
								setActivePostType( pt );
							}
						} }
					>
						{ pt }
					</div>
				) ) }
			</aside>

			<main className="ttcounter-main">
				<h2 className="ttcounter-taxonomies-title">
					<span>{activePostType}</span>{' '}
						{__( 'post-type taxonomies where term counts are shown', 'taxonomy-terms-counter' )}
					</h2>
				<div className="ttcounter-taxonomies">
					{ taxonomies
						.filter( ( t ) => t.types?.includes( activePostType ) )
						.map( ( t ) => {
							const disabled = t.rest_base.length === 0;
							const currentSettings =
								taxonomySettings[ activePostType ] || {};
							const checked =
								currentSettings[ t.slug ]?.show_count || false;
							const inputId = `ttcounter-tax-${ t.slug }`;

							return (
								<div
									key={ t.slug }
									className={ `ttcounter-box ${
										disabled ? 'disabled' : ''
									}` }
									title={
										disabled
											? __( 'show_in_rest = false', 'taxonomy-terms-counter' )
											: ''
									}
								>
									<input
										id={ inputId }
										type="checkbox"
										disabled={ disabled }
										checked={ checked }
										onChange={ ( e ) =>
											setTaxonomySetting(
												t.slug,
												e.target.checked
											)
										}
									/>
									<label htmlFor={ inputId }>
										{ t.name }
									</label>
								</div>
							);
						} ) }
				</div>

				<div className="ttcounter-actions">
					{ taxonomies.filter( ( t ) =>
						t.types?.includes( activePostType )
					).length > 0 ? (
						<button
							className={ `button button-primary ttcounter-save-btn ${
								isSaving ? 'is-loading' : ''
							}` }
							disabled={ ! isDirty || isSaving }
							onClick={ save }
						>
							<span className="ttcounter-btn-label">
								{ __( 'Save', 'taxonomy-terms-counter' ) }
							</span>
							<span className="ttcounter-spinner" aria-hidden />
						</button>
					) : (
						<span className="ttcounter-no-tax">
							{ __(
								'No taxonomies for this post type',
								'taxonomy-terms-counter'
							) }
						</span>
					) }

					{ saveResult && (
						<span className={ `ttcounter-save-result ${ saveResult }` }>
							{ saveResult === 'success'
								? __(
									'Settings saved',
									'taxonomy-terms-counter'
								)
								: __(
									'Save failed',
									'taxonomy-terms-counter'
								) }
						</span>
					) }
				</div>
			</main>
		</div>
	);
}

createRoot( document.getElementById( 'ttcounter-admin-root' ) ).render( <TtcounterApp /> );
