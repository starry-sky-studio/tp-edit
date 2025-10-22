import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import TextAlign from "@tiptap/extension-text-align";
import {
	BackgroundColor,
	Color,
	TextStyle,
} from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import suggestion from "@/features/editor/components/Menus/Common/Emoji/suggestion";
import ImageBlock from "./command/ImageBlock";
import SlashCommand from "./command/slash";
import CalloutView from "../components/Callout";
import { Callout } from "./custom/custom-callout";

export const baseExtensions = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] },
		blockquote: {
			HTMLAttributes: {
				class: "custom-blockquote",
			},
		},
		code: {
			HTMLAttributes: {
				class: "custom-code",
			},
		},
	}),
	ImageBlock,
	Emoji.configure({
		emojis: gitHubEmojis,
		enableEmoticons: true,
		suggestion,
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
	Callout.configure({
		view: CalloutView,
	}),
];
