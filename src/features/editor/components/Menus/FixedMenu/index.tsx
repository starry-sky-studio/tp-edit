import type { Editor } from "@tiptap/react";
import CodeBlock from "../Common/CodeBlock";
import EmojiCommand from "../Common/Emoji";
import Heading from "../Common/Heading";
import type ImgUpload from "../Common/ImgUpload";
import TableCommand from "../Common/Table";
import TextAlign from "../Common/TextAlign";
import ColorComp from "../Common/TextColor";
import TextStyles from "../Common/TextStyles";

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
		</div>
	);
};

export default FixedMenuComp;
