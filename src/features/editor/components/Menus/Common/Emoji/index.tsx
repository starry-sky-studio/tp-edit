import data from "@emoji-mart/data";
import zh from "@emoji-mart/data/i18n/zh.json";
import Picker from "@emoji-mart/react";
import type { Editor } from "@tiptap/react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmojiCommand = ({ editor }: { editor: Editor | null }) => {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="border-none border-0">
					<div className="flex items-center justify-center  transition-all">
						<Smile />
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="border-none shadow-none">
				<Picker
					data={data}
					onEmojiSelect={(emoji: any) => {
						editor?.chain().focus().insertContent(emoji.native).run();
					}}
					theme="light"
					previewPosition="none"
					skinTonePosition="none"
					i18n={zh}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default EmojiCommand;
