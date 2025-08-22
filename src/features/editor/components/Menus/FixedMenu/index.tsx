import type { Editor } from "@tiptap/react";
import Heading from "../Common/Heading";
import TextStyles from "../Common/TextStyles";

const FixedMenuComp = ({ editor }: { editor: Editor | null }) => {
	if (!editor || !editor.isEditable) return null;

	return (
		<div className="flex h-10 w-full items-center justify-start gap-0.5 border-x border-gray-300 px-2">
			<Heading editor={editor} />
			<TextStyles editor={editor} />
		</div>
	);
};

export default FixedMenuComp;
