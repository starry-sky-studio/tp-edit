import type { Editor } from "@tiptap/react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TextAlign = ({ editor }: { editor: Editor | null }) => {
	const [currentHead, setCurrentHead] = useState(
		<AlignCenter className="size-4" />,
	);

	const getAlignList = useCallback(() => {
		if (!editor) return [];

		return [
			{
				icon: <AlignLeft className="size-4" />,
				title: "左对齐",
				isActive: () => editor.isActive({ textAlign: "left" }),
				action: () => editor.chain().focus().setTextAlign("left").run(),
			},
			{
				icon: <AlignCenter className="size-4" />,
				title: "居中对齐",
				isActive: () => editor.isActive({ textAlign: "center" }),
				action: () => editor.chain().focus().setTextAlign("center").run(),
			},
			{
				icon: <AlignRight className="size-4" />,
				title: "右对齐",
				isActive: () => editor.isActive({ textAlign: "right" }),
				action: () => editor.chain().focus().setTextAlign("right").run(),
			},
			{
				icon: <AlignJustify className="size-4" />,
				title: "两端对齐",
				isActive: () => editor.isActive({ textAlign: "justify" }),
				action: () => editor.chain().focus().setTextAlign("justify").run(),
			},
		];
	}, [editor]);

	const updateCurrentHead = useCallback(() => {
		if (!editor) return;

		const alignList = getAlignList();
		const active = alignList.find((i) => i.isActive()) ?? alignList[0];
		setCurrentHead(active.icon);
	}, [editor, getAlignList]);

	useEffect(() => {
		if (!editor || !editor.isEditable) return;

		updateCurrentHead();

		const handleUpdate = () => {
			updateCurrentHead();
		};

		editor.on("selectionUpdate", handleUpdate);
		editor.on("transaction", handleUpdate);

		return () => {
			editor.off("selectionUpdate", handleUpdate);
			editor.off("transaction", handleUpdate);
		};
	}, [editor, updateCurrentHead]);

	if (!editor || !editor.isEditable) return null;
	const alignList = getAlignList();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="border-none border-0">
					{currentHead}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{alignList.map((item) => (
					<DropdownMenuCheckboxItem
						key={item.title}
						checked={item.isActive()}
						onCheckedChange={() => {
							item.action();
							setTimeout(updateCurrentHead, 0);
						}}
					>
						<span className="flex items-center gap-2">
							{item.icon}
							{item.title}
						</span>
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TextAlign;
