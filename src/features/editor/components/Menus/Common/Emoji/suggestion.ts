import { type ComputePositionConfig, computePosition } from "@floating-ui/dom";
import type { Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";

import EmojiList from "./EmojiList";

// 定义位置计算结果类型
interface PositionResult {
	x: number;
	y: number;
	strategy: "absolute" | "fixed";
}

// 定义 Emoji 数据结构
interface EmojiData {
	shortcodes: string[];
	tags: string[];
	[key: string]: any;
}

// 定义 suggestion 属性
interface SuggestionProps {
	editor: Editor;
	query: string;
	clientRect: () => DOMRect;
	event?: KeyboardEvent;
	[key: string]: any;
}

// 定义组件实例类型
interface ComponentInstance {
	element: Element;
	updateProps: (props: SuggestionProps) => void;
	destroy: () => void;
	ref?: {
		onKeyDown: (props: SuggestionProps) => boolean;
	};
}

// 定义虚拟元素类型
interface VirtualElement {
	getBoundingClientRect: () => DOMRect;
}

// 定义位置计算配置
const positionConfig: Partial<ComputePositionConfig> = {
	placement: "bottom-start",
};

const suggestion = {
	items: ({
		editor,
		query,
	}: {
		editor: Editor;
		query: string;
	}): EmojiData[] => {
		return editor.storage.emoji.emojis
			.filter(({ shortcodes, tags }: EmojiData) => {
				return (
					shortcodes.find((shortcode: string) =>
						shortcode.startsWith(query.toLowerCase()),
					) || tags.find((tag: string) => tag.startsWith(query.toLowerCase()))
				);
			})
			.slice(0, 5);
	},

	allowSpaces: false,

	render: () => {
		let component: ComponentInstance | undefined;

		function repositionComponent(clientRect: DOMRect | null): void {
			if (!component || !component.element || !clientRect) {
				return;
			}

			const virtualElement: VirtualElement = {
				getBoundingClientRect() {
					return clientRect;
				},
			};

			computePosition(
				virtualElement,
				component.element as HTMLElement,
				positionConfig,
			).then((pos: PositionResult) => {
				if (!component?.element) return;
				Object.assign((component.element as HTMLElement).style, {
					left: `${pos.x}px`,
					top: `${pos.y}px`,
					position: pos.strategy === "fixed" ? "fixed" : "absolute",
				});
			});
		}

		return {
			onStart: (props: any): void => {
				component = new ReactRenderer(EmojiList, {
					props,
					editor: props.editor,
				}) as unknown as ComponentInstance;

				document.body.appendChild(component.element);

				const clientRect =
					typeof props.clientRect === "function" ? props.clientRect() : null;
				repositionComponent(clientRect);
			},

			onUpdate(props: any): void {
				if (component) {
					component.updateProps(props);

					const clientRect =
						typeof props.clientRect === "function" ? props.clientRect() : null;
					repositionComponent(clientRect);
				}
			},

			onKeyDown(props: any): boolean {
				if (props.event?.key === "Escape") {
					if (component && document.body.contains(component.element)) {
						document.body.removeChild(component.element);
					}
					component?.destroy();
					return true;
				}

				return component?.ref?.onKeyDown(props) || false;
			},

			onExit(): void {
				if (component && document.body.contains(component.element)) {
					document.body.removeChild(component.element);
				}
				component?.destroy();
			},
		};
	},
};

export default suggestion;
