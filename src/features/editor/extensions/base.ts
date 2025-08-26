import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

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
	TextStyle,
	Color,
	Highlight.configure({
		multicolor: true,
	}),
	TextAlign.configure({
		types: ["heading", "paragraph", "listItem", "taskItem"],
	}),
	CodeBlock,
	TaskList,
	TaskItem.configure({
		nested: true, // 支持嵌套任务
	}),
];
