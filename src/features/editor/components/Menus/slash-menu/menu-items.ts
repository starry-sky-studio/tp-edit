import type { Editor } from "@tiptap/core";
import {
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Text,
	Info,
} from "lucide-react";

export interface CommandItem {
	title: string;
	description: string;
	icon: any;
	command: ({ editor, range }: { editor: Editor; range: any }) => void;
}

const items: CommandItem[] = [
	{
		title: "Text",
		description: "Just start typing with plain text",
		icon: Text,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.toggleNode("paragraph", "paragraph")
				.run();
		},
	},
	{
		title: "Heading 1",
		description: "Large section heading",
		icon: Heading1,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading",
		icon: Heading2,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading",
		icon: Heading3,
		command: ({ editor, range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bullet list",
		icon: List,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a numbered list",
		icon: ListOrdered,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Code Block",
		description: "Add a code block",
		icon: Code,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Quote",
		description: "Add a quote block",
		icon: Quote,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Callout",
		description: "Add a Callout",
		icon: Info,
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCallout().run();
		},
	},
];

const getSuggestionItems = ({ query }: { query: string }) => {
	// TODO: support fuzzy search
	return items.filter((item) => {
		return item.title.toLowerCase().includes(query.toLowerCase());
	});
};

export default getSuggestionItems;
