import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { NodeSelection } from "prosemirror-state";

// 扩展 Table：当整体表格（NodeSelection）被选中时，Delete/Backspace 直接删除该表格
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
	TableHeader.configure({
		HTMLAttributes: {
			class: "border border-gray-300 bg-gray-50 font-semibold p-2 text-left",
		},
	}),
	TableCell.configure({
		HTMLAttributes: {
			class: "border border-gray-300 p-2",
		},
	}),
];
