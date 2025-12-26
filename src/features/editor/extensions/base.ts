import suggestion from "@/features/editor/components/Menus/Common/Emoji/suggestion";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import TextAlign from "@tiptap/extension-text-align";
import {
	BackgroundColor,
	Color,
	TextStyle
} from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import CodeBlockView from "../components/code-block/code-block-view";
import ImageBlock from "./command/ImageBlock";
import SlashCommand from "./command/slash";

import { CustomCodeBlock } from "./custom/custom-code-block";

const lowlight = createLowlight(common);

import { AI } from "@/features/ai/extensions/custom-ai";
import CalloutView from "../components/Callout";
import { Callout } from "./custom/custom-callout";
import { tableExtensions } from "./tables";

export const baseExtensions = [
	StarterKit.configure({
		heading: { levels: [1, 2, 3] },
		blockquote: {
			HTMLAttributes: {
				class: "custom-blockquote"
			}
		},
		code: {
			HTMLAttributes: {
				class: "custom-code"
			}
		}
	}),
	ImageBlock,
	Emoji.configure({
		emojis: gitHubEmojis,
		enableEmoticons: true,
		suggestion
	}),
	TextAlign.configure({
		types: ["heading", "paragraph"]
	}),
	Color,
	TextStyle,
	BackgroundColor,
	Placeholder.configure({
		placeholder: "Type '/' for commands...",
		emptyEditorClass:
			"before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0"
	}),
	SlashCommand,
	CustomCodeBlock.configure({
		defaultLanguage: "plaintext",
		view: CodeBlockView,
		lowlight,
		HTMLAttributes: {
			spellCheck: "false"
		}
	}),
	Callout.configure({
		view: CalloutView
	}),
	AI,
	GlobalDragHandle,
	...tableExtensions
];
