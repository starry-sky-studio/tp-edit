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

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
	if (!editor || !editor.isEditable) return null;

	return (
		<div className="flex h-10 items-center w-full justify-start gap-0.5  px-2">
			<Heading editor={editor} />
			<TextStyles editor={editor} />
			<TextAlign editor={editor} />
			<TextColor editor={editor} />
			<Emoji editor={editor} />
			<ImgUpload editor={editor} />
			<AddTable editor={editor} />
		</div>
	);
};

export default FixedMenuComp;
