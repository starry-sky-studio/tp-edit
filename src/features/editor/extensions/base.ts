import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

export const baseExtensions = [
	StarterKit.configure({
		heading: {
			levels: [1, 2, 3],
		},
		codeBlock: false,
	}),
	Placeholder.configure({
		placeholder: "开始输入内容...",
		emptyEditorClass:
			"before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0",
	}),
	Underline,
	Link,
	TextStyle, // 必须有这个，Color 才能工作
	Color,
	Highlight.configure({
		multicolor: true, // 支持多色高亮
	}),
];
