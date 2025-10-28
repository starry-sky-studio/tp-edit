import {
	NodeViewContent,
	NodeViewWrapper,
	type ReactNodeViewProps,
} from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "../EmojiPicker";

const CalloutView = (props: ReactNodeViewProps) => {
	const { node, updateAttributes } = props;

	const { icon, backgroundColor, textColor, borderColor } = node.attrs;

	const handleEmojiSelect = (emoji: any) => {
		updateAttributes({ icon: emoji.native });
	};

	return (
		<NodeViewWrapper>
			<div
				className="callout-node flex p-3 rounded-md border my-1"
				style={{
					backgroundColor,
				}}
			>
				<div className="flex items-start mr-3 text-lg" contentEditable={false}>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghostTransparent"
								size="icon"
								className="border-none border-0 text-xl hover:bg-transparent"
							>
								{icon}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="border-none shadow-none">
							<EmojiPicker onEmojiSelect={handleEmojiSelect} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex-1 min-w-0 cursor-text">
					<NodeViewContent className="prose prose-sm max-w-none" />
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export default CalloutView;
