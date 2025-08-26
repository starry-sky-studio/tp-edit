import type { Editor } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import type { Range } from "@tiptap/pm/model";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import getSuggestionItems from "@/features/editor/components/Menus/slash-menu/menu-items";
import renderItems from "@/features/editor/components/Menus/slash-menu/render-items";

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
