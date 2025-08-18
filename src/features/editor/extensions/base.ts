import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

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
];
