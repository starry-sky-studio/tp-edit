import { Table } from "@tiptap/extension-table";
import { NodeSelection } from "@tiptap/pm/state";

export const SelectableTable = Table.extend({
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
