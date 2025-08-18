import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type { Editor } from "@tiptap/react";
import { useHeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ChevronDownIcon } from "../tiptap-icons/chevron-down-icon";
import { HeadingButton } from "../tiptap-ui/heading-button";

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
	const { isVisible, activeLevel, isActive, canToggle, levels, label, Icon } =
		useHeadingDropdownMenu({
			editor: editor,
			levels: [1, 2, 3],
			hideWhenUnavailable: true,
		});

	// 如果编辑器未准备好或没有选中内容，则不渲染气泡菜单
	if (!editor || !editor.isEditable) return null;

	console.log(levels);

	return (
		<div className="flex h-10 w-full items-center justify-start gap-0.5 border-x border-gray-300 px-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						disabled={!canToggle}
						aria-label={label}
						aria-pressed={isActive}
						className="flex cursor-pointer items-center justify-center gap-0.5 rounded-sm px-2 py-1 outline-0 hover:bg-gray-200"
					>
						<Icon className="size-4" />
						<ChevronDownIcon className="size-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="z-50 w-full bg-white">
					<DropdownMenuItem className="bg-red-400 outline-0"></DropdownMenuItem>
					{levels.map((level) => (
						<DropdownMenuItem key={level} className="bg-red-400 outline-0">
							<HeadingButton editor={editor} level={level} text={label} />
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default FixedMenuComp;
