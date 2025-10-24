import { InputRule, mergeAttributes, Node } from "@tiptap/core";
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

const inputRegex = /^:::([a-z]+)?[\s\n]$/;

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
				(attrs = {}) =>
				({ commands }: { commands: any }) => {
					const defaultAttrs = {
						icon: "💡",
						backgroundColor: "#FFF5EB",
						...attrs,
					};

					return commands.toggleWrap(this.name, defaultAttrs);
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
			mergeAttributes({ "data-type": this.name }, HTMLAttributes),
			0,
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(this.options.view);
	},

	/**
	 * 添加输入规则
	 * 支持通过输入 ::: 语法快速创建 Callout
	 */
	addInputRules() {
		return [
			// relative tiptap issue: https://github.com/ueberdosis/tiptap/issues/2974
			new InputRule({
				find: inputRegex,
				handler: ({ range, commands }) => {
					const start = range.from;
					const end = range.to;

					commands.deleteRange({ from: start, to: end });
					commands.insertContentAt(start, {
						type: this.name,
						content: [
							{
								type: "paragraph",
								content: [],
							},
						],
					});

					commands.setTextSelection(start + 1);
				},
			}),
		];
	},
});
