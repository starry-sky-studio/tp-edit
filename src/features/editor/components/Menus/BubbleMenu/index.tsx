import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useCallback, useEffect, useState } from "react";
import { TextStyles } from "../Common";

interface Props {
	editor: Editor | null;
}

const BubbleMenuComp = ({ editor }: Props) => {
	const [selectedNode, setSelectedNode] = useState<{
		type: string;
		isBlock: boolean;
	} | null>(null);

	const updateSelection = useCallback(() => {
		if (!editor) return;
		const { state } = editor;
		const sel = state.selection;

		// 重置选择状态
		let nodeInfo = null;

		if (sel instanceof NodeSelection) {
			const node = sel.node;
			console.log(node, "node");
			// 检查是否是图片节点（包括 image 和 imageBlock）
			if (node.type.name === "image" || node.type.name === "imageBlock") {
				nodeInfo = {
					type: node.type.name,
					isBlock: node.type.name === "imageBlock",
				};
			}
		}

		setSelectedNode(nodeInfo);
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

	if (!editor || !editor.isEditable || editor.isActive("codeBlock"))
		return null;

	return (
		<BubbleMenu
			editor={editor}
			className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
		>
			{!selectedNode?.isBlock && <TextStyles editor={editor} />}
		</BubbleMenu>
	);
};

export default BubbleMenuComp;
