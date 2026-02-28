/* global TTCounterClassic, MutationObserver, Node */

document.addEventListener( 'DOMContentLoaded', () => {
	if ( ! window.TTCounterClassic ) {
		return;
	}

	const { taxonomies, counts } = TTCounterClassic;
	const updateChecklist = ( taxonomy, checklist ) => {
		const map = counts[ taxonomy ] || {};
		const items = checklist.querySelectorAll( 'li' );

		for ( const li of items ) {
			const textNodes = Array.from( li.childNodes ).filter(
				( node ) =>
					node.nodeType === Node.TEXT_NODE &&
					node.textContent.replace( /\u00a0/g, ' ' ).trim()
			);

			if ( textNodes.length === 0 ) {
				continue;
			}

			const textNode = textNodes[ textNodes.length - 1 ];
			const raw = textNode.textContent
				.replace( /\u00a0/g, ' ' )
				.replace( /\s*\(\d+\)\s*$/, '' )
				.trim();

			if ( ! raw ) {
				continue;
			}

			if ( map[ raw ] === undefined ) {
				continue;
			}

			let label = `${ raw } (${ map[ raw ] })`;

			if ( typeof window.TTCounterClassicFilterLabel === 'function' ) {
				const filtered = window.TTCounterClassicFilterLabel( {
					taxonomy,
					name: raw,
					count: map[ raw ],
					label,
				} );

				if ( typeof filtered === 'string' && filtered.length > 0 ) {
					label = filtered;
				}
			}

			textNode.textContent = ` ${ label }`;
		}
	};

	const tagsdivs = document.querySelectorAll( '.tagsdiv' );

	for ( const div of tagsdivs ) {
		const taxonomy = div.id;
		if ( ! taxonomies.includes( taxonomy ) ) {
			continue;
		}

		const checklist = div.querySelector( '.tagchecklist' );
		if ( ! checklist ) {
			continue;
		}

		updateChecklist( taxonomy, checklist );

		const observer = new MutationObserver( () =>
			updateChecklist( taxonomy, checklist )
		);
		observer.observe( checklist, { childList: true, subtree: true } );
	}
} );
