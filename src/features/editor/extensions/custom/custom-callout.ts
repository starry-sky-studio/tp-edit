import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

interface CalloutOptions {
	HTMLAttributes: Record<string, any>;
	view: any;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		callout: {
			toggleCallout: () => ReturnType;
		};
	}
}

export const Callout = Node.create<CalloutOptions>({
	name: "callout",

	group: "block",
	content: "block+",
	defining: true,

	addOptions() {
		return {
			HTMLAttributes: {},
			view: null,
		};
	},

	addCommands() {
		return {
			toggleCallout:
				() =>
				({ commands }: { commands: any }) => {
					return commands.toggleWrap(this.name);
				},
		};
	},

	addAttributes() {
		return {
			icon: {
				default: "💡",
				parseHTML: (element) => element.getAttribute("data-callout-icon"),
				renderHTML: (attributes) => ({ "data-callout-icon": attributes.icon }),
			},
			backgroundColor: {
				default: "#FFF5EB",
				parseHTML: (element) => element.getAttribute("data-callout-bg"),
				renderHTML: (attributes) => ({
					"data-callout-bg": attributes.backgroundColor,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: `div[data-type="${this.name}"]`,
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(
				{ "data-type": this.name },
				this.options.HTMLAttributes,
				HTMLAttributes,
			),
			0,
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(this.options.view);
	},
});
