import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useCallback, useEffect, useState } from "react";
import { TextStyles } from "../Common";
import TableMenus from "../TableMenus";

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
			// 检查是否是图片节点（包括 image 和 imageBlock）
			if (node.type.name === "image" || node.type.name === "imageBlock") {
				nodeInfo = {
					type: node.type.name,
					isBlock: node.type.name === "imageBlock",
				};
			}
		}

		// 检查是否是表格选择 (_CellSelection, TableSelection)
		if (
			typeof sel === "object" &&
			sel !== null &&
			"constructor" in sel &&
			typeof sel.constructor?.name === "string" &&
			(sel.constructor.name === "_CellSelection" ||
				sel.constructor.name === "TableSelection") // 确保 TableSelection 也能被识别
		) {
			nodeInfo = {
				type: "table",
				isBlock: true,
			};
		}

		// 处理光标在表格单元格内的情况 (TextSelection)
		// 如果没有识别出特定的节点选择 (如图片或表格选择)，但编辑器处于表格活动状态，则将其视为表格上下文
		// 【保留此逻辑以确保在选择表格内容时，selectedNode?.type 始终为 "table"】
		if (!nodeInfo && editor.isActive("table")) {
			nodeInfo = {
				type: "table",
				isBlock: true,
			};
		}

		setSelectedNode(nodeInfo);
	}, [editor]);

	const shouldShow = useCallback(
		({ state }: { state: Editor["state"] }) => {
			if (!editor) return false;
			const sel = state.selection;

			// Hide for image/imageBlock node selections
			if (sel instanceof NodeSelection) {
				const node = sel.node;
				if (node.type.name === "image" || node.type.name === "imageBlock") {
					return false;
				}
			}

			// Show for table selections (TableSelection or CellSelection)
			if (
				typeof sel === "object" &&
				sel !== null &&
				"constructor" in sel &&
				typeof (sel as any).constructor?.name === "string" &&
				((sel as any).constructor.name === "TableSelection" ||
					(sel as any).constructor.name === "_CellSelection") // 确保 CellSelection 也能触发显示
			) {
				// 只有在选择了内容时才显示表格菜单
				return true;
			}

			// 【修改点】移除：Show when cursor is inside a table (even without TableSelection)
			// 这样点击表格单元格内部 (TextSelection) 时将不会显示菜单

			// For text selections, only show when selection is not empty AND not inside a table
			if (!sel.empty && !editor.isActive("table")) {
				return true;
			}

			return false;
		},
		[editor],
	);

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
			shouldShow={shouldShow as any}
			className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg"
		>
			{selectedNode?.type === "table" ? (
				<TableMenus editor={editor} />
			) : (
				<TextStyles editor={editor} />
			)}
		</BubbleMenu>
	);
};

export default BubbleMenuComp;
