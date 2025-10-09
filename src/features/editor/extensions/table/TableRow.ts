import TiptapTableRow from "@tiptap/extension-table-row";

export const TableRow = TiptapTableRow.extend({
	// 禁用 GapCursor，避免光标出现在行间隙位置，减少误操作
	allowGapCursor: false,
	// 该项目不使用真实的表头单元格节点，行仅允许普通单元格
	// 说明：如需列头部交互，使用 TableHeader 扩展提供的装饰（非节点）
	content: "tableCell*",
});

export default TableRow;
