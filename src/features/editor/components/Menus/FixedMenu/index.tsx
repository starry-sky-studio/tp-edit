import type { Editor } from "@tiptap/react";

import {
	AddTable,
	Emoji,
	Heading,
	ImgUpload,
	TextAlign,
	TextColor,
	TextStyles,
} from "../Common";
import TableCommand from "../Common/AddTable";
import EmojiCommand from "../Common/Emoji";
import ColorComp from "../Common/TextColor";

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
	if (!editor || !editor.isEditable) return null;

	return (
		<div className="flex h-10 items-center w-full justify-start gap-0.5  px-2">
			<Heading editor={editor} />
			<TextStyles editor={editor} />
			<TextAlign editor={editor} />
			<ColorComp editor={editor} />
			<EmojiCommand editor={editor} />
			<TableCommand editor={editor} />
			<TextColor editor={editor} />
			<Emoji editor={editor} />
			<ImgUpload editor={editor} />
			<AddTable editor={editor} />
		</div>
	);
};

export default FixedMenuComp;
