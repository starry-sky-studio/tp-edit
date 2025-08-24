import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
	Bold as IconBold,
	Code as IconCode,
	Italic as IconItalic,
	Strikethrough as IconStrikethrough,
	Underline as IconUnderline,
	Link as IconLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { BubbleTextStyleMenu } from "./TextColorStyle";

interface BubbleMenuItem {
	name: string;
	isActive: () => boolean;
	command: () => void;
	icon?: LucideIcon;
	color?: string;
	type: "button" | "color" | "highlight";
}

interface Props {
	editor: Editor | null;
}

const TextStyles = ({ editor }: Props) => {
	//监听颜色
	const [, setUpdate] = useState(0);
	useEffect(() => {
		if (!editor) return;
		const update = () => setUpdate((n) => n + 1);
		// 监听编辑器的 transaction，每次操作都会触发
		editor.on("transaction", update);
		return () => {
			editor.off("transaction", update);
		};
	}, [editor]);
	if (!editor || !editor.isEditable) return null;
	const buttonItems: BubbleMenuItem[] = [
		{
			name: "Bold",
			isActive: () => editor.isActive("bold"),
			command: () => editor.chain().focus().toggleBold().run(),
			icon: IconBold,
			type: "button",
		},
		{
			name: "Italic",
			isActive: () => editor.isActive("italic"),
			command: () => editor.chain().focus().toggleItalic().run(),
			icon: IconItalic,
			type: "button",
		},
		{
			name: "Underline",
			isActive: () => editor.isActive("underline"),
			command: () => editor.chain().focus().toggleUnderline().run(),
			icon: IconUnderline,
			type: "button",
		},
		{
			name: "Strike",
			isActive: () => editor.isActive("strike"),
			command: () => editor.chain().focus().toggleStrike().run(),
			icon: IconStrikethrough,
			type: "button",
		},
		{
			name: "Code",
			isActive: () => editor.isActive("code"),
			command: () => editor.chain().focus().toggleCode().run(),
			icon: IconCode,
			type: "button",
		},
		{
			name: "Link",
			isActive: () => editor.isActive("link"),
			command: () => {
				const url = prompt("请输入链接 URL");
				if (url)
					editor
						.chain()
						.focus()
						.extendMarkRange("link")
						.setLink({ href: url })
						.run();
			},
			icon: IconLink,
			type: "button",
		},
	];

	return (
		<div className="flex items-center gap-1">
			{buttonItems.map((item) => {
				if (!item.icon) return null;
				const Icon = item.icon;
				return (
					<Button
						key={item.name}
						variant={item.isActive() ? "secondary" : "ghost"}
						size="icon"
						onClick={item.command}
						title={item.name}
					>
						<Icon className="h-4 w-4" />
					</Button>
				);
			})}

			{/* 颜色 + 高亮 下拉菜单 */}
			<BubbleTextStyleMenu editor={editor} />
		</div>
	);
};

export default TextStyles;
