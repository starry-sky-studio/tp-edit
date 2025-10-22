import type { Editor } from "@tiptap/react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker from "@/features/editor/components/EmojiPicker";

const EmojiCommand = ({ editor }: { editor: Editor | null }) => {
	const handleEmojiSelect = (emoji: any) => {
		editor?.chain().focus().insertContent(emoji.native).run();
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="border-none border-0">
					<Smile />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="border-none shadow-none">
				<EmojiPicker onEmojiSelect={handleEmojiSelect} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default EmojiCommand;
