import { Table } from "@tiptap/extension-table";
import { NodeSelection } from "prosemirror-state";
import { TableCell } from "./table/Cell";
import { TableHeader } from "./table/TableHeader";
import { TableRow } from "./table/TableRow";

// 表格相关扩展：
// - 不使用真实表头节点（tableHeader），表格行仅允许 tableCell
// - 通过 TableHeader 扩展提供列头部的交互装饰（grip 选择整列）

// 扩展 Table：
// 1) 整表被 NodeSelection 选中时，Backspace/Delete 直接删除表格
// 2) 其他行为沿用默认 Table 扩展
const SelectableTable = Table.extend({
	addKeyboardShortcuts() {
		return {
			Backspace: () => {
				const { state } = this.editor;
				if (
					state.selection instanceof NodeSelection &&
					state.selection.node.type.name === "table"
				) {
					this.editor.commands.deleteSelection();
					return true;
				}
				return false;
			},
			Delete: () => {
				const { state } = this.editor;
				if (
					state.selection instanceof NodeSelection &&
					state.selection.node.type.name === "table"
				) {
					this.editor.commands.deleteSelection();
					return true;
				}
				return false;
			},
		};
	},
});

export const tableExtensions = [
	SelectableTable.configure({
		resizable: true,
		HTMLAttributes: {
			class: "table-auto border-collapse border border-gray-300 w-full",
		},
	}),
	TableRow.configure({
		HTMLAttributes: {
			class: "border border-gray-300",
		},
	}),
	// 仅启用 TableHeader 扩展以提供列头部的装饰与交互（不强制插入表头行）
	TableHeader.configure({
		HTMLAttributes: {
			class: "border border-gray-300 bg-gray-50 font-semibold p-2 text-left",
		},
	}),
	// 行/列首插入点（基于单元格的点）
	TableCell.configure({
		HTMLAttributes: {
			class: "border border-gray-300 p-2",
		},
	}),
];
