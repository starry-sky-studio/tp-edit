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
			new InputRule({
				find: inputRegex,
				handler: ({ range, match, commands }) => {
					const start = range.from;
					const end = range.to;

					// 创建 Callout 节点
					const type = match[1] || "info";
					const typeConfig: Record<
						string,
						{ icon: string; backgroundColor: string }
					> = {
						info: { icon: "💡", backgroundColor: "#FFF5EB" },
						warning: { icon: "⚠️", backgroundColor: "#FEF3C7" },
						error: { icon: "❌", backgroundColor: "#FEE2E2" },
						success: { icon: "✅", backgroundColor: "#D1FAE5" },
						tip: { icon: "💡", backgroundColor: "#E0F2FE" },
					};

					const attrs = typeConfig[type] || typeConfig.info;

					// 删除输入的文本并插入 Callout 节点
					commands.deleteRange({ from: start, to: end });
					commands.insertContentAt(start, {
						type: this.name,
						attrs,
						content: [
							{
								type: "paragraph",
								content: [],
							},
						],
					});

					// 关键：将光标设置到 Callout 内容区域的开始位置
					commands.setTextSelection(start + 1);
				},
			}),
		];
	},
});
