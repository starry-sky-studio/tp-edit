import { findParentNode, InputRule, mergeAttributes, Node } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
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

	addKeyboardShortcuts() {
		return {
			Backspace: ({ editor }) => {
				const { state, view } = editor;
				const { selection } = state;

				if (!selection.empty) return false; // (1)如果选中内容，不处理

				const { $from } = selection;
				if ($from.parentOffset !== 0) return false; // (2)如果光标不是在节点开头，不处理

				const previousPosition = $from.before($from.depth) - 1;
				if (previousPosition < 1) return false; // (3)如果没有上一个节点，不处理

				const previousPos = state.doc.resolve(previousPosition);
				if (!previousPos?.parent) return false; // (4)解析失败，不处理

				const previousNode = previousPos.parent;
				const parentNode = findParentNode(() => true)(selection);
				if (!parentNode) return false;

				const { node, pos, depth } = parentNode;
				if (depth !== 1) return false; // (5)如果是嵌套的节点，不处理

				// (6)如果前一个节点是 callout，且当前节点不是 callout
				if (node.type !== this.type && previousNode.type === this.type) {
					const { content, nodeSize } = node;
					const { tr } = state;

					tr.delete(pos, pos + nodeSize);
					tr.setSelection(
						TextSelection.near(tr.doc.resolve(previousPosition - 1)),
					);
					tr.insert(previousPosition - 1, content);
					view.dispatch(tr);

					return true;
				}

				return false;
			},
		};
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
