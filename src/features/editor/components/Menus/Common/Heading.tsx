import type { Editor } from "@tiptap/react";
import { Heading1, Heading2, Heading3, Type } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Heading = ({ editor }: { editor: Editor | null }) => {
	const [currentHead, setCurrentHead] = useState(<Type className="size-4" />);

	const getHeadList = useCallback(() => {
		if (!editor) return [];

		return [
			{
				icon: <Type className="size-4" />,
				title: "text",
				isActive: () => editor.isActive("paragraph"),
				action: () => editor.chain().focus().setParagraph().run(),
			},
			{
				icon: <Heading1 className="size-4" />,
				title: "Heading 1",
				isActive: () => editor.isActive("heading", { level: 1 }),
				action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
			},
			{
				icon: <Heading2 className="size-4" />,
				title: "Heading 2",
				isActive: () => editor.isActive("heading", { level: 2 }),
				action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			},
			{
				icon: <Heading3 className="size-4" />,
				title: "Heading 3",
				isActive: () => editor.isActive("heading", { level: 3 }),
				action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			},
		];
	}, [editor]);

	const updateCurrentHead = useCallback(() => {
		if (!editor) return;

		const headList = getHeadList();
		const activeItem = headList.find((item) => item.isActive()) ?? headList[0];
		setCurrentHead(activeItem?.icon);
	}, [editor, getHeadList]);

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

	const headList = getHeadList();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="border-none border-0">
					{currentHead}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{headList.map((item) => (
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

export default Heading;
