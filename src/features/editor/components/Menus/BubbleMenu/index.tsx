import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useCallback, useEffect, useState } from "react";
import TextStyles from "../Common/TextStyles";

interface Props {
	editor: Editor | null;
}

const BubbleMenuComp = ({ editor }: Props) => {
	const [isImageSelected, setIsImageSelected] = useState(false);

	const updateSelection = useCallback(() => {
		if (!editor) return;
		const { state } = editor;
		const sel = state.selection;

		let isImage = false;

		if (
			sel instanceof NodeSelection &&
			(sel as NodeSelection).node?.type?.name === "image"
		) {
			isImage = true;
		}

		setIsImageSelected(isImage);
	}, [editor]);

	useEffect(() => {
		if (!editor) return;

		editor.on("selectionUpdate", updateSelection);
		editor.on("update", updateSelection);

		return () => {
			editor?.off("selectionUpdate", updateSelection);
			editor?.off("update", updateSelection);
		};
	}, [editor, updateSelection]);

	if (!editor || !editor.isEditable) return null;

	return (
		<BubbleMenu
			editor={editor}
			className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
		>
			<TextStyles editor={editor} />
		</BubbleMenu>
	);
};

export default BubbleMenuComp;
