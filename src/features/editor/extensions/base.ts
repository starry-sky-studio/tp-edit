import TextAlign from "@tiptap/extension-text-align";
import {
	BackgroundColor,
	Color,
	TextStyle,
} from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import SlashCommand from "./command/slash";

export const baseExtensions = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] },
		codeBlock: false,
	}),
	TextAlign.configure({
		types: ["heading", "paragraph"],
	}),
	Color,
	TextStyle,
	BackgroundColor,
	Placeholder.configure({
		placeholder: "Type '/' for commands...",
		emptyEditorClass:
			"before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0",
	}),
	SlashCommand,
];
