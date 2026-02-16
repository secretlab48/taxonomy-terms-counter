import { registerPlugin } from '@wordpress/plugins';
import { useCallback, useEffect } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';

import { useTtcounterTermCounts } from './admin-single-post/useTermCounts';
import { ttcounterUpdateTermsInSidebar } from './admin-single-post/updateTermsInSidebar';
import { useTtcounterSidebarObserver } from './admin-single-post/useSidebarObserver';

function TtcounterTaxonomyTermsLoader() {
	const termsByTax = useTtcounterTermCounts();

	const updateSidebar = useCallback( () => {
		ttcounterUpdateTermsInSidebar( termsByTax );
	}, [ termsByTax ] );

	useEffect( () => {
		updateSidebar();
		doAction( 'ttcounter.sidebarUpdated', termsByTax );
	}, [ updateSidebar ] );

	useTtcounterSidebarObserver( () => {
		updateSidebar();
		doAction( 'ttcounter.sidebarUpdated', termsByTax );
	}, [] );

	return null;
}

registerPlugin( 'taxonomy-terms-loader', {
	render: TtcounterTaxonomyTermsLoader,
} );
