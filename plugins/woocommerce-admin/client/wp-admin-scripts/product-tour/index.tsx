/**
 * External dependencies
 */
import { render, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TourKit, TourKitTypes } from '@woocommerce/components';
import qs from 'qs';

/**
 * Internal dependencies
 */
import { useTmceIframeFocusStyle } from './use-tmce-iframe-focus-style';
import { useActiveEditorType } from './use-active-editor-type';
import {
	bindEnableGuideModeClickEvent,
	waitUntilElementTopNotChange,
} from './utils';

const getTourConfig = ( {
	isExcerptEditorTmceActive,
	isContentEditorTmceActive,
	closeHandler,
}: {
	isExcerptEditorTmceActive: boolean;
	isContentEditorTmceActive: boolean;
	closeHandler: () => void;
} ): TourKitTypes.WooConfig => {
	return {
		placement: 'bottom-start',
		options: {
			effects: {
				spotlight: {
					interactivity: {
						enabled: true,
						rootElementSelector: '#wpwrap',
					},
				},
				arrowIndicator: true,
				autoScroll: {
					behavior: 'auto',
					block: 'center',
				},
			},
			popperModifiers: [
				{
					name: 'arrow',
					options: {
						padding: ( {
							popper,
						}: {
							popper: { width: number };
						} ) => {
							return {
								// Align the arrow to the left of the popper.
								right: popper.width - 34,
							};
						},
					},
				},
			],
		},
		steps: [
			{
				referenceElements: {
					desktop: '#title',
				},
				focusElement: {
					desktop: '#title',
				},
				meta: {
					heading: __( 'Product name', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Start typing your new product name here. This will be what your customers will see in your store.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#postdivrich',
				},
				focusElement: {
					iframe: isContentEditorTmceActive
						? '#content_ifr'
						: undefined,
					desktop: isContentEditorTmceActive
						? '#tinymce'
						: '#wp-content-editor-container > .wp-editor-area',
				},
				meta: {
					heading: __(
						'Add your product description',
						'woocommerce'
					),
					descriptions: {
						desktop: __(
							'Start typing your new product name here. Add your full product description here. Describe your product in detail.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#woocommerce-product-data',
				},
				focusElement: {
					desktop: '#_regular_price',
				},
				meta: {
					heading: __( 'Add your product data', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Use the tabs to switch between sections and insert product details. Start by adding your product price.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#postexcerpt',
				},
				focusElement: {
					iframe: isExcerptEditorTmceActive
						? '#excerpt_ifr'
						: undefined,
					desktop: isExcerptEditorTmceActive
						? '#tinymce'
						: '#wp-excerpt-editor-container > .wp-editor-area',
				},
				meta: {
					heading: __(
						'Add your short product description',
						'woocommerce'
					),
					descriptions: {
						desktop: __(
							'Type a quick summary for your product here. This will appear on the product page right under the product name.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#postimagediv',
				},
				focusElement: {
					desktop: '#set-post-thumbnail',
				},
				meta: {
					heading: __( 'Add your product image', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Upload an image to your product here. Ideally a JPEG or PNG about 600 px wide or bigger. This image will be shown in your store’s catalog.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#tagsdiv-product_tag',
				},
				focusElement: {
					desktop: '#new-tag-product_tag',
				},
				meta: {
					heading: __( 'Add your product tags', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Add your product tags here. Tags are a method of labeling your products to make them easier for customers to find. For example, if you sell clothing, and you have a lot of cat prints, you could make a tag for “cat.”',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#product_catdiv',
				},
				meta: {
					heading: __( 'Add your product categories', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Add your product categories here. Assign categories to your products to make them easier to browse through and find in your store.',
							'woocommerce'
						),
					},
				},
			},
			{
				referenceElements: {
					desktop: '#submitdiv',
				},
				focusElement: {
					desktop: '#submitdiv',
				},
				meta: {
					heading: __( 'Publish your product 🎉', 'woocommerce' ),
					descriptions: {
						desktop: __(
							'Good work! Now you can publish your product to your store by hitting the “Publish” button or keep editing it.',
							'woocommerce'
						),
					},
					primaryButton: {
						text: __( 'Keep editing', 'woocommerce' ),
					},
				},
			},
		],
		closeHandler,
	};
};

const ProductTour = () => {
	const [ showTour, setShowTour ] = useState< boolean >( false );

	const { isTmce: isContentEditorTmceActive } = useActiveEditorType( {
		editorWrapSelector: '#wp-content-wrap',
	} );
	const { isTmce: isExcerptEditorTmceActive } = useActiveEditorType( {
		editorWrapSelector: '#wp-excerpt-wrap',
	} );

	const { style: contentTmceIframeFocusStyle } = useTmceIframeFocusStyle( {
		isActive: showTour && isContentEditorTmceActive,
		iframeSelector: '#content_ifr',
	} );
	const { style: excerptTmceIframeFocusStyle } = useTmceIframeFocusStyle( {
		isActive: showTour && isExcerptEditorTmceActive,
		iframeSelector: '#excerpt_ifr',
	} );

	const tourConfig = getTourConfig( {
		isContentEditorTmceActive,
		isExcerptEditorTmceActive,
		closeHandler: () => setShowTour( false ),
	} );

	useEffect( () => {
		bindEnableGuideModeClickEvent( ( e ) => {
			e.preventDefault();
			setShowTour( true );
		} );

		const query = qs.parse( window.location.search.slice( 1 ) );
		if ( query && query.tutorial === 'true' ) {
			const intervalId = waitUntilElementTopNotChange(
				tourConfig.steps[ 0 ].referenceElements?.desktop || '',
				() => setShowTour( true ),
				500
			);
			return () => clearInterval( intervalId );
		}
		// only run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	if ( ! showTour ) {
		return null;
	}

	return (
		<>
			<style>
				{ contentTmceIframeFocusStyle }
				{ excerptTmceIframeFocusStyle }
				{ `.wp-editor-area:focus {
						border: 1.5px solid #007CBA;
					}` }
			</style>
			<TourKit config={ tourConfig } />
		</>
	);
};

const root = document.createElement( 'div' );
root.setAttribute( 'id', 'product-tour-root' );
render( <ProductTour />, document.body.appendChild( root ) );