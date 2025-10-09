import type { Editor } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MergeCellsIcon, SplitCellsIcon } from "@/styles/svg";
import TableCommand from "../Common/AddTable";
import EmojiCommand from "../Common/Emoji";
import Heading from "../Common/Heading";
import TextAlign from "../Common/TextAlign";
import ColorComp from "../Common/TextColor";
import TextStyles from "../Common/TextStyles";

const TableMenus = ({ editor }: { editor: Editor | null }) => {
	if (!editor || !editor.isEditable) return null;

	return (
		<div className="flex relative h-10 items-center w-full justify-start gap-0.5  px-2">
			<Heading editor={editor} />
			<Tooltip>
				<TooltipTrigger>
					<MergeCellsIcon />
				</TooltipTrigger>
				<TooltipContent>
					<p>合并单元格</p>
				</TooltipContent>
			</Tooltip>
			<TextAlign editor={editor} />
			<TextStyles editor={editor} />
			<ColorComp editor={editor} />
			<Tooltip>
				<TooltipTrigger>
					<Trash2 />
				</TooltipTrigger>
				<TooltipContent>
					<p>删除列</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default TableMenus;
