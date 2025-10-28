// import { Table, TableKit } from "@tiptap/extension-table";

import { TableCell } from "./table/TableCell";
import { TableHeader } from "./table/TableHeader";
import { TableRow } from "./table/TableRow";
import { SelectableTable } from "./table/table";

// 表格相关扩展：
// - 不使用真实表头节点（tableHeader），表格行仅允许 tableCell
// - 通过 TableHeader 扩展提供列头部的交互装饰（grip 选择整列）

// 扩展 Table：
// 1) 整表被 NodeSelection 选中时，Backspace/Delete 直接删除表格
// 2) 鼠标划过表格时自动选中表格
// 3) 其他行为沿用默认 Table 扩展

export const tableExtensions = [
	SelectableTable.configure({
		resizable: true,

		// 🖱️ 调整手柄宽度
		handleWidth: 10,

		// 📐 单元格最小宽度
		cellMinWidth: 50,

		// 🔒 最后一列是否可调整
		lastColumnResizable: true,
		HTMLAttributes: {
			class: " border-gray-300 w-full",
		},
	}),
	TableRow.configure({
		HTMLAttributes: {
			class: "border border-gray-300",
		},
	}),
	// 仅启用 TableHeader 扩展以提供列头部的装饰与交互
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
