import type { Editor } from "@tiptap/react";
import { Table } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TableGridSelector from "./TableGridSelector";

const TableCommand = ({ editor }: { editor: Editor | null }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="border-none border-0 hover:bg-gray-100"
					title="插入表格"
				>
					<div className="flex items-center justify-center transition-all">
						<Table className="w-4 h-4" />
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="border border-gray-200 shadow-lg p-0 bg-transparent"
				align="start"
				sideOffset={5}
			>
				<TableGridSelector editor={editor} onClose={handleClose} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TableCommand;
