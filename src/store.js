import { create } from 'zustand';

export const useTtcounterStore = create( ( set ) => ( {
	activePostType: null,
	taxonomySettings: {},
	isDirty: false,

	setActivePostType: ( slug ) => set( { activePostType: slug } ),

	setTaxonomySetting: ( slug, value ) =>
		set( ( state ) => {
			const postType = state.activePostType;
			if ( ! postType ) {
				return state;
			}

			const currentSettings = state.taxonomySettings[ postType ] || {};

			return {
				taxonomySettings: {
					...state.taxonomySettings,
					[ postType ]: {
						...currentSettings,
						[ slug ]: { show_count: value },
					},
				},
				isDirty: true,
			};
		} ),

	setInitialSettings: ( settings ) => set( { taxonomySettings: settings } ),
} ) );
