import { mergeAttributes, type Range } from "@tiptap/core";
import { Image as BaseImage } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageBlockView from "../../components/Menus/ImageBlock/imageBlockView";

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		imageBlock: {
			setImageBlock: (attributes: { src: string }) => ReturnType;
			setImageBlockAt: (attributes: {
				src: string;
				pos: number | Range;
			}) => ReturnType;
			setImageBlockAlign: (align: "left" | "center" | "right") => ReturnType;
			setImageBlockWidth: (width: number) => ReturnType;
		};
	}
}

const ImageBlock = BaseImage.extend({
	name: "imageBlock",

	group: "block",

	defining: true,

	isolating: true,

	draggable: true,

	addAttributes() {
		return {
			src: {
				default: "",
				parseHTML: (element: Element) => element.getAttribute("src"),
				renderHTML: (attributes: any) => ({
					src: attributes.src
				})
			},
			width: {
				default: null,
				parseHTML: (element: Element) => element.getAttribute("data-width"),
				renderHTML: (attributes: any) => ({
					"data-width": attributes.width
				})
			},
			align: {
				default: "center",
				parseHTML: (element: Element) => element.getAttribute("data-align"),
				renderHTML: (attributes: any) => ({
					"data-align": attributes.align
				})
			},
			alt: {
				default: undefined,
				parseHTML: (element: Element) => element.getAttribute("alt"),
				renderHTML: (attributes: any) => ({
					alt: attributes.alt
				})
			}
		};
	},

	renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
		return [
			"img",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
		];
	},

	addCommands() {
		return {
			setImageBlock:
				(attrs: { src: string }) =>
				({ commands }) => {
					return commands.insertContent({
						type: "imageBlock",
						attrs: { src: attrs.src }
					});
				},

			setImageBlockAt:
				(attrs: { src: string; pos: number | Range }) =>
				({ commands }) => {
					return commands.insertContentAt(attrs.pos, {
						type: "imageBlock",
						attrs: { src: attrs.src }
					});
				},

			setImageBlockAlign:
				(align: "left" | "center" | "right") =>
				({ commands }) =>
					commands.updateAttributes("imageBlock", { align }),

			setImageBlockWidth:
				(width: number) =>
				({ commands }) =>
					commands.updateAttributes("imageBlock", {
						width: `${Math.max(0, Math.min(100, width))}%`
					})
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(ImageBlockView);
	}
});

export default ImageBlock;
