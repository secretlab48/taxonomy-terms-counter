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
		const hasHierarchicalList = taxPanel.querySelector(
			'.editor-post-taxonomies__hierarchical-terms-list'
		);
		const hasTokenField = taxPanel.querySelector(
			'.components-form-token-field'
		);

		if ( hasHierarchicalList ) {
			ttcounterUpdateHierarchicalPanel( taxPanel, allTerms );
			continue;
		}

		if ( hasTokenField ) {
			ttcounterUpdateNonHierarchicalPanel( taxPanel, allTerms );
		}
	}
}

function ttcounterUpdateHierarchicalPanel( taxPanel, allTerms ) {
	const labels = taxPanel.querySelectorAll(
		'.components-checkbox-control__label'
	);
	if ( ! labels.length ) {
		return;
	}

	const domTermNames = Array.from( labels ).map( ( label ) =>
		label.textContent.replace( /\s*\(\d+\)\s*$/, '' ).trim()
	);

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

	if ( ! matchedTaxTerms ) {
		return;
	}

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

function ttcounterUpdateNonHierarchicalPanel( taxPanel, allTerms ) {
	const tokenTextSpans = taxPanel.querySelectorAll(
		'.components-form-token-field__token-text > span[aria-hidden="true"]'
	);

	if ( ! tokenTextSpans.length ) {
		return;
	}

	const domTermNames = Array.from( tokenTextSpans ).map( ( span ) =>
		span.textContent.replace( /\s*\(\d+\)\s*$/, '' ).trim()
	);

	let matchedTaxTerms = null;

	for ( const taxTerms of Object.values( allTerms ) ) {
		const storeTerms = Object.values( taxTerms );
		const storeNames = storeTerms.map( ( t ) => t.name.trim() );

		const allMatch = domTermNames.every( ( name ) =>
			storeNames.includes( name )
		);

		if ( allMatch ) {
			matchedTaxTerms = storeTerms;
			break;
		}
	}

	if ( ! matchedTaxTerms ) {
		return;
	}

	const termMap = new Map(
		matchedTaxTerms.map( ( t ) => [ t.name.trim(), t.count ] )
	);

	for ( const span of tokenTextSpans ) {
		const rawName = span.textContent
			.replace( /\s*\(\d+\)\s*$/, '' )
			.trim();

		const count = termMap.get( rawName );
		if ( count === undefined ) {
			continue;
		}

		const defaultLabel = `${ rawName } (${ count })`;
		span.textContent = applyFilters(
			'ttcounter.termCountLabel',
			defaultLabel,
			{
				name: rawName,
				count,
				label: span,
			}
		);
	}
}
