import type { Selection } from "@tiptap/pm/state";
import { NodeSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import { findTable } from "@/features/editor/extensions/table";
import { type SelectionElementType, SelectionType } from "@/types";

/**
 * getSelectionElementType
 * 作用：判断当前 Tiptap/ProseMirror 选区主要选中了哪种元素类型。
 *
 * @param selection - 当前的 ProseMirror 选区对象 (Selection)。
 * @returns 选区元素类型的字符串描述，使用 SelectionType 常量（或节点的 type.name）。
 */
export const getSelectionElementType = (
	selection: Selection,
): SelectionElementType => {
	// 1. 选中了表格单元格区域 (拖拽多单元格)
	if (selection instanceof CellSelection) {
		return SelectionType.TABLE; // 选中了多个或一个完整的单元格，表示在处理表格结构
	}

	// 2. 选中了完整的节点 (图片、整个表格、水平线等)
	if (selection instanceof NodeSelection) {
		// NodeSelection 选中的节点类型可能是自定义类型，直接返回其 type.name。
		// 这提供了对所有 NodeSelection 类型的支持。
		return selection.node.type.name;
	}

	// 3. 选中了文本 (TextSelection) 或光标模式 (Selection.empty)
	// 需要判断光标或文本所在的容器上下文
	const $pos = selection.$anchor;

	// 检查光标是否在表格单元格内（这是最常见的上下文）
	const table = findTable(selection);
	if (table) {
		// 检查光标所在的父级容器（通常是单元格内容）的上一级是否为表格单元格
		// node(-1) 对应的就是 'tableCell' 或 'tableHeader' 节点
		return SelectionType.TABLE;
	}

	// 4. 文本选区 (TextSelection) 或其他块级容器
	// 返回光标或选区文本所在的最直接的父级块节点类型
	// (例如: 'paragraph', 'heading', 'listItem', 'codeBlock')
	// 注意：如果选区跨越了多个块节点，这里返回的是选区锚点所在的父节点类型
	return $pos.parent.type.name;
};
