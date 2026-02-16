import { applyFilters } from '@wordpress/hooks';

export function ttcounterUpdateTermsInSidebar( allTerms ) {
	if ( ! allTerms || Object.keys( allTerms ).length === 0 ) {
		return;
	}

	const sidebar = document.querySelector(
		'.interface-interface-skeleton__sidebar'
	);
	if ( ! sidebar ) {
		return;
	}

	const taxPanels = sidebar.querySelectorAll( '.components-panel__body' );
	if ( ! taxPanels.length ) {
		return;
	}

	for ( const taxPanel of taxPanels ) {
		const labels = taxPanel.querySelectorAll(
			'.components-checkbox-control__label'
		);
		if ( ! labels.length ) {
			continue;
		}

		// DOM -> term names.
		const domTermNames = Array.from( labels ).map( ( label ) =>
			label.textContent.replace( /\s*\(\d+\)\s*$/, '' ).trim()
		);

		// Find the matching taxonomy in allTerms.
		let matchedTaxTerms = null;

		for ( const taxTerms of Object.values( allTerms ) ) {
			const storeTerms = Object.values( taxTerms );

			if ( storeTerms.length !== domTermNames.length ) {
				continue;
			}

			const storeNames = storeTerms.map( ( t ) => t.name.trim() );

			const allMatch = storeNames.every( ( name ) =>
				domTermNames.includes( name )
			);

			if ( allMatch ) {
				matchedTaxTerms = storeTerms;
				break;
			}
		}

		// Taxonomy not found -> skip the panel.
		if ( ! matchedTaxTerms ) {
			continue;
		}

		// Render counts.
		const termMap = new Map(
			matchedTaxTerms.map( ( t ) => [ t.name.trim(), t.count ] )
		);

		for ( const label of labels ) {
			const rawName = label.textContent
				.replace( /\s*\(\d+\)\s*$/, '' )
				.trim();

			const count = termMap.get( rawName );
			if ( count === undefined ) {
				continue;
			}

			const defaultLabel = `${ rawName } (${ count })`;
			label.textContent = applyFilters(
				'ttcounter.termCountLabel',
				defaultLabel,
				{
					name: rawName,
					count,
					label,
				}
			);
		}
	}
}
