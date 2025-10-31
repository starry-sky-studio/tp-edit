import type { Editor } from "@tiptap/react";
import CodeBlock from "../Common/CodeBlock";
import EmojiCommand from "../Common/Emoji";
import Heading from "../Common/Heading";
import ImgUpload from "../Common/ImgUpload";
import TextAlign from "../Common/TextAlign";
import ColorComp from "../Common/TextColor";
import TextStyles from "../Common/TextStyles";

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
	if (!editor || !editor.isEditable) return null;

	return (
		<div className="flex h-10 items-center w-full justify-start gap-0.5 border-x border-gray-300 px-2">
			<Heading editor={editor} />
			<TextStyles editor={editor} />
			<TextAlign editor={editor} />
			<ColorComp editor={editor} />
			<EmojiCommand editor={editor} />
			<ImgUpload editor={editor} />
			<CodeBlock editor={editor} />
		</div>
	);
};

export default FixedMenuComp;
