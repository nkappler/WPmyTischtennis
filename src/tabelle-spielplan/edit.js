// @ts-check
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import { InspectorControls } from '@wordpress/block-editor';
import { __experimentalHStack as HStack, PanelBody, TextControl } from '@wordpress/components';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {import('wordpress__blocks').BlockEditProps<{
 * 	url: string;
 * 	search: string;
 * 	replace: string;
 * }>} props
 * @return {import('react').ReactNode} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { url, search, replace } = attributes;
	console.log('Edit attributes:', attributes);
	return <>
		<InspectorControls>
			<PanelBody title={__('Settings', 'tabelle-spielplan')}>
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__(
						'Abruf-URL',
						'tabelle-spielplan'
					)}
					value={url || ''}
					onChange={(value) =>
						setAttributes({ url: value })
					}
				/>
				<HStack spacing={1} style={{ alignItems: "start" }}>

					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Suchen',
							'tabelle-spielplan'
						)}
						value={search || ''}
						onChange={(value) =>
							setAttributes({ search: value })
						}
					/>


					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Ersetzen',
							'tabelle-spielplan'
						)}
						value={replace || ''}
						onChange={(value) =>
							setAttributes({ replace: value })
						}
					/>
				</HStack>

			</PanelBody>
		</InspectorControls>
		<p {...useBlockProps()}>
			{__(
				'Tabelle & Spielplan',
				'tabelle-spielplan'
			)}
		</p>
	</>;
}
