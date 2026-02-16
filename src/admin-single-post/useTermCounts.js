/* global TTCounter */

import { useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';

export function useTtcounterTermCounts() {
	const TAXONOMIES = useMemo( () => {
		return Array.isArray( TTCounter.data ) ? TTCounter.data : [];
	}, [] );

	const postType = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostType(),
		[]
	);

	const { notices, isSaving } = useSelect(
		( select ) => ( {
			notices: select( 'core/notices' ).getNotices(),
			isSaving: select( 'core/editor' ).isSavingPost(),
		} ),
		[]
	);

	const [ termsByTax, setTermsByTax ] = useState( {} );

	const fetchCounts = () => {
		if ( ! postType || ! TAXONOMIES.length ) {
			return;
		}

		const filteredTaxonomies = applyFilters(
			'ttcounter.termCountTaxonomies',
			TAXONOMIES,
			postType
		);

		apiFetch( {
			path: '/ttcounter/v1/term-counts',
			method: 'POST',
			data: {
				post_type: postType,
				taxonomies: filteredTaxonomies,
			},
		} ).then( ( data ) => {
			const filteredData = applyFilters(
				'ttcounter.termCountData',
				data || {},
				postType
			);
			setTermsByTax( filteredData );
		} );
	};

	useEffect( () => {
		fetchCounts();
	}, [] );

	useEffect( () => {
		if ( isSaving ) {
			return;
		}

		const successNotice = notices.find(
			( n ) =>
				n.status === 'success' &&
				( n.id?.includes( 'save' ) ||
					n.id?.includes( 'publish' ) ||
					n.id?.includes( 'updated' ) ||
					n.id?.includes( 'post' ) )
		);

		if ( successNotice ) {
			fetchCounts();
		}
	}, [ notices ] );

	return termsByTax;
}

export const useTermCounts = useTtcounterTermCounts;
