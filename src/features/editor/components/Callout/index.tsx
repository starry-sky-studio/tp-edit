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

	const { icon, backgroundColor } = node.attrs;

	const handleEmojiSelect = (emoji: any) => {
		updateAttributes({ icon: emoji.native });
	};

	return (
		<NodeViewWrapper>
			<div className="flex p-1 rounded-md" style={{ backgroundColor }}>
				<div className="flex items-center">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghostTransparent"
								size="icon"
								className="border-none border-0 text-xl"
							>
								{icon}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="border-none shadow-none">
							<EmojiPicker onEmojiSelect={handleEmojiSelect} />
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<NodeViewContent></NodeViewContent>
			</div>
		</NodeViewWrapper>
	);
};

export default CalloutView;
