/* global MutationObserver, Node */

import { useEffect, useRef } from '@wordpress/element';

export function useTtcounterSidebarObserver( callback, deps ) {
	const observerRef = useRef( null );
	const callbackRef = useRef( callback );

	useEffect( () => {
		callbackRef.current = callback;
	}, [ callback ] );

	useEffect( () => {
		const sidebar = document.querySelector(
			'.interface-interface-skeleton__sidebar'
		);
		if ( ! sidebar ) {
			return;
		}

		observerRef.current = new MutationObserver( ( mutations ) => {
			for ( const mutation of mutations ) {
				if ( mutation.type !== 'childList' ) {
					continue;
				}

				const changedNodes = [
					...mutation.addedNodes,
					...mutation.removedNodes,
				];

				const isOnlyTextChange =
					changedNodes.length > 0 &&
					changedNodes.every(
						( node ) =>
							node.nodeType === Node.TEXT_NODE ||
							node.nodeType === Node.COMMENT_NODE
					);

				if ( isOnlyTextChange ) {
					continue;
				}

				callbackRef.current();
				break;
			}
		} );

		observerRef.current.observe( sidebar, {
			childList: true,
			subtree: true,
		} );

		return () => {
			observerRef.current?.disconnect();
			observerRef.current = null;
		};
	}, deps );
}
