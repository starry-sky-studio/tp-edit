import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Editor } from "@tiptap/react";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TableUtils {
	static getTableSelection(
		editor: Editor,
	): "row" | "column" | "table" | "none" {
		try {
			if (!editor.isActive("table")) {
				return "none";
			}

			const { selection } = editor.state;

			// 非 CellSelection：落在单个单元格内部或光标，仅视为行层级的操作
			if (!(selection instanceof CellSelection)) return "row";

			// 获取表格的 TableMap 和选择的矩形区域
			const map = TableMap.get(selection.$anchorCell.node(-1));
			const start = selection.$anchorCell.start(-1);
			const rect = map.rectBetween(
				selection.$anchorCell.pos - start,
				selection.$headCell.pos - start,
			);

			// 判断是否选择了整个表格
			if (
				rect.left === 0 &&
				rect.right === map.width &&
				rect.top === 0 &&
				rect.bottom === map.height
			) {
				return "table";
			}

			// 判断是否选择了完整的行（从左到右）
			if (rect.left === 0 && rect.right === map.width) {
				return "row";
			}

			// 判断是否选择了完整的列（从上到下）
			if (rect.top === 0 && rect.bottom === map.height) {
				return "column";
			}

			// 其他情况（部分单元格），默认为行操作
			return "row";
		} catch (error) {
			console.warn("Error in getTableSelection:", error);
			return "none";
		}
	}
}
