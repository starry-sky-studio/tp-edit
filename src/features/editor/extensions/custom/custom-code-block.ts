import CodeBlockLowlight, {
	type CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";

export interface CustomCodeBlockOptions extends CodeBlockLowlightOptions {
	view: any;
}

const TAB_CHAR = "\u00A0\u00A0"; // 两个不换行空格

export const CustomCodeBlock = CodeBlockLowlight.extend<CustomCodeBlockOptions>(
	{
		selectable: true,

		addOptions() {
			return {
				...this.parent?.(),
				view: null,
			} as CustomCodeBlockOptions;
		},

		addKeyboardShortcuts() {
			return {
				...this.parent?.(),
				Tab: () => {
					if (!this.editor.isActive("codeBlock")) {
						return false;
					}
					this.editor
						.chain()
						.command(({ tr }) => {
							tr.insertText(TAB_CHAR);
							return true;
						})
						.run();
					return true;
				},
				"Mod-a": () => {
					if (!this.editor.isActive("codeBlock")) {
						return false;
					}

					const { state } = this.editor;
					const { $from } = state.selection;

					let codeBlockNode = null;
					let codeBlockPos = null;
					let depth = 0;

					for (depth = $from.depth; depth > 0; depth--) {
						const node = $from.node(depth);
						if (node.type.name === "codeBlock") {
							codeBlockNode = node;
							codeBlockPos = $from.start(depth) - 1;
							break;
						}
					}

					if (!codeBlockNode || codeBlockPos === null) {
						return false;
					}

					const codeBlockStart = codeBlockPos;
					const codeBlockEnd = codeBlockPos + codeBlockNode.nodeSize;

					const contentStart = codeBlockStart + 1;
					const contentEnd = codeBlockEnd - 1;

					this.editor.commands.setTextSelection({
						from: contentStart,
						to: contentEnd,
					});

					return true;
				},
			};
		},

		addNodeView() {
			return ReactNodeViewRenderer(this.options.view);
		},
	},
);
