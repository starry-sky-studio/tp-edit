import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Button } from "@/components/ui/button";
import {
	Bold as IconBold,
	Italic as IconItalic,
	Underline as IconUnderline,
	Strikethrough as IconStrikethrough,
	Code as IconCode,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BubbleMenuItem {
	name: string;
	isActive: () => boolean;
	command: () => void;
	icon: LucideIcon;
}

interface Props {
	editor: Editor | null;
}

const BubbleMenuComp = (props: Props) => {
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
	];

	return (
		<BubbleMenu
			editor={editor}
			className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
		>
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
		</BubbleMenu>
	);
};

export default BubbleMenuComp;
