import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import TextStyles from "../Common/TextStyles";
import Heading from "../Common/Heading";
interface Props {
	editor: Editor | null;
}

const BubbleMenuComp = (props: Props) => {
	if (!props.editor || !props.editor.isEditable) return null;

	const editor = props.editor;

	return (
		<BubbleMenu
			editor={editor}
			className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
		>
			<Heading editor={editor} />
			<TextStyles editor={editor} />
		</BubbleMenu>
	);
};

export default BubbleMenuComp;
