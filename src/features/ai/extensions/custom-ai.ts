/**
 * AI TipTap 扩展
 * 定义 AI 节点类型和相关命令
 */

import type { AINodeAttributes } from "@/types";
import { AIState } from "@/types";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AIView } from "../components/ai-view";

export interface AIOptions {
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		ai: {
			/**
			 * 插入 AI 节点
			 */
			setAI: (options: {
				prompt?: string;
				state?: AIState;
				content?: string;
			}) => ReturnType;

			/**
			 * 更新 AI 节点属性
			 */
			updateAI: (attributes: Partial<AINodeAttributes>) => ReturnType;
		};
	}
}

export const AI = Node.create<AIOptions>({
	name: "ai",

	group: "block",

	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {}
		};
	},

	addAttributes() {
		return {
			prompt: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-prompt") || "",
				renderHTML: (attributes) => {
					if (!attributes.prompt) {
						return {};
					}
					return {
						"data-prompt": attributes.prompt
					};
				}
			},
			state: {
				default: AIState.INPUT,
				parseHTML: (element) =>
					(element.getAttribute("data-state") as AIState) || AIState.INPUT,
				renderHTML: (attributes) => {
					return {
						"data-state": attributes.state
					};
				}
			},
			content: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-content") || "",
				renderHTML: (attributes) => {
					if (!attributes.content) {
						return {};
					}
					return {
						"data-content": attributes.content
					};
				}
			},
			model: {
				default: "gpt-3.5-turbo",
				parseHTML: (element) =>
					element.getAttribute("data-model") || "gpt-3.5-turbo",
				renderHTML: (attributes) => {
					return {
						"data-model": attributes.model
					};
				}
			},
			error: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-error") || "",
				renderHTML: (attributes) => {
					if (!attributes.error) {
						return {};
					}
					return {
						"data-error": attributes.error
					};
				}
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: `div[data-type="${this.name}"]`
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes({ "data-type": this.name }, HTMLAttributes),
			0
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(AIView);
	},

	addCommands() {
		return {
			setAI:
				(options = {}) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: {
							prompt: options.prompt || "",
							state: options.state || AIState.INPUT,
							content: options.content || "",
							model: "gpt-3.5-turbo"
						}
					});
				},
			updateAI:
				(attributes) =>
				({ chain }) => {
					return chain().updateAttributes(this.name, attributes).run();
				}
		};
	}
});
