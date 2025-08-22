import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import type { Range } from "@tiptap/pm/model";
import Suggestion from "@tiptap/suggestion";
import renderItems from "@/features/editor/components/Menus/slash-menu/render-items";
import getSuggestionItems from "@/features/editor/components/Menus/slash-menu/menu-items";

export interface CommandProps {
	editor: Editor;
	range: Range;
}

export const slashMenuPluginKey = new PluginKey("slash-command");

const Command = Extension.create({
	name: "slash-command",

	addOptions() {
		return {
			suggestion: {
				char: "/",
				command: ({
					editor,
					range,
					props,
				}: {
					editor: Editor;
					range: Range;
					props: any;
				}) => {
					props.command({ editor, range });
				},
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				pluginKey: slashMenuPluginKey,
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});

const SlashCommand = Command.configure({
	suggestion: {
		items: getSuggestionItems,
		render: renderItems,
	},
});

export default SlashCommand;
