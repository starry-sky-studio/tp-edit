import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
	Bold as IconBold,
	Code as IconCode,
	Italic as IconItalic,
	List as IconList,
	ListOrdered as IconListOrdered,
	Strikethrough as IconStrikethrough,
	Underline as IconUnderline,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BubbleMenuItem {
	name: string;
	isActive: () => boolean;
	command: () => void;
	icon: LucideIcon;
}

interface Props {
	editor: Editor | null;
}

const TextStyles = (props: Props) => {
	if (!props.editor || !props.editor.isEditable) return null;

	const editor = props.editor;

	const items: BubbleMenuItem[] = [
		{
			name: "Bold",
			isActive: () => editor.isActive("bold"),
			command: () => editor.chain().focus().toggleBold().run(),
			icon: IconBold,
		},
		{
			name: "Italic",
			isActive: () => editor.isActive("italic"),
			command: () => editor.chain().focus().toggleItalic().run(),
			icon: IconItalic,
		},
		{
			name: "Underline",
			isActive: () => editor.isActive("underline"),
			command: () => editor.chain().focus().toggleUnderline().run(),
			icon: IconUnderline,
		},
		{
			name: "Strike",
			isActive: () => editor.isActive("strike"),
			command: () => editor.chain().focus().toggleStrike().run(),
			icon: IconStrikethrough,
		},
		{
			name: "Code",
			isActive: () => editor.isActive("code"),
			command: () => editor.chain().focus().toggleCode().run(),
			icon: IconCode,
		},
		{
			name: "orderedList",
			isActive: () => editor.isActive("orderedList"),
			command: () => editor.chain().focus().toggleOrderedList().run(),
			icon: IconListOrdered,
		},
		{
			name: "bulletList",
			isActive: () => editor.isActive("bulletList"),
			command: () => editor.chain().focus().toggleBulletList().run(),
			icon: IconList,
		},
	];

	return (
		<>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<Button
						key={item.name}
						variant={item.isActive() ? "secondary" : "ghost"}
						size="icon"
						onClick={() => item.command()}
						title={item.name}
					>
						<Icon className="h-4 w-4" />
					</Button>
				);
			})}
		</>
	);
};

export default TextStyles;
