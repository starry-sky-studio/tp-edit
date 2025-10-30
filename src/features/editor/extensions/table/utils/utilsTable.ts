import { findParentNode } from "@tiptap/core";
import type { Selection, Transaction } from "@tiptap/pm/state";
import type { Rect } from "@tiptap/pm/tables";
import { CellSelection, TableMap } from "@tiptap/pm/tables";

/**
 * findTable
 * 作用：从当前选择/光标位置向上查找并返回最靠近的整个表格节点（<table>）。
 *
 * @param selection - ProseMirror/Tiptap 的当前选择对象。
 * @returns 包含表格节点 (node) 和其在文档中起始位置 (start) 的对象，如果未找到则返回 null。
 */
export const findTable = (selection: Selection) =>
	// findParentNode 是 Tiptap 提供的工具，用于向上遍历父节点。
	// 我们查找 node.type.spec.tableRole 属性等于 "table" 的节点。
	findParentNode((node) => node.type.spec.tableRole === "table")(selection);

/**
 * isCellSelection
 * 作用：检查当前选择是否为 CellSelection (单元格选择)。
 * CellSelection 意味着用户通过拖拽选择了一个或多个单元格，这是表格操作特有的选择类型。
 *
 * @param selection - ProseMirror/Tiptap 的当前选择对象。
 * @returns 如果是 CellSelection，返回 true。
 */
export const isCellSelection = (
	selection: Selection,
): selection is CellSelection => selection instanceof CellSelection;

/**
 * isRectSelected
 * 作用：检查一个给定的矩形区域（Rect，即表格的行/列范围）是否**完全**被当前选中的单元格覆盖。
 * 这个函数用于判断用户是否已经选中了指定的列或行范围。
 *
 * @param rect - 要检查的表格矩形区域（包含 left, right, top, bottom 坐标）。
 * @returns 返回一个函数，该函数接受 CellSelection 对象并返回是否选中。
 */
export const isRectSelected = (rect: Rect) => (selection: CellSelection) => {
	// 1. 获取表格的布局信息 (TableMap)
	const map = TableMap.get(selection.$anchorCell.node(-1));
	const start = selection.$anchorCell.start(-1); // 表格内容起始位置

	// 2. cellsInRect(rect): 获取目标矩形区域内的所有单元格在 map 中的索引。
	const cells = map.cellsInRect(rect);

	// 3. cellsInRect(...): 获取当前用户选中的所有单元格在 map 中的索引。
	const selectedCells = map.cellsInRect(
		map.rectBetween(
			selection.$anchorCell.pos - start, // 选中起始位置 (相对表格)
			selection.$headCell.pos - start, // 选中结束位置 (相对表格)
		),
	);

	// 4. 遍历目标矩形区域内的每个单元格
	for (let i = 0, count = cells.length; i < count; i += 1) {
		// 检查目标单元格（cells[i]）是否在用户选中的单元格列表 (selectedCells) 中。
		if (selectedCells.indexOf(cells[i]) === -1) {
			// 只要有一个目标单元格没有被选中，就说明整个矩形区域未被完全选中。
			return false;
		}
	}

	// 所有目标单元格都被选中。
	return true;
};

/**
 * isColumnSelected
 * 作用：检查表格的某一列是否被用户**完全**选中。
 * 它是基于 isRectSelected 的封装，只检查某一列的范围。
 *
 * @param columnIndex - 要检查的列的索引（从 0 开始）。
 * @returns 返回一个函数，该函数接受 Selection 对象并返回是否选中该列。
 */
export const isColumnSelected =
	(columnIndex: number) => (selection: Selection) => {
		if (isCellSelection(selection)) {
			// 找到表格节点，获取其布局信息。
			const map = TableMap.get(selection.$anchorCell.node(-1));

			// 定义一个覆盖整个列的矩形区域
			return isRectSelected({
				left: columnIndex, // 列的起始
				right: columnIndex + 1, // 列的结束
				top: 0, // 顶行
				bottom: map.height, // 底行（map.height 是总行数）
			})(selection as CellSelection);
		}

		return false;
	};

/**
 * isColumnSelected
 * 作用：检查表格的某一列是否被用户**完全**选中。
 * 它是基于 isRectSelected 的封装，只检查某一列的范围。
 *
 * @param columnIndex - 要检查的列的索引（从 0 开始）。
 * @returns 返回一个函数，该函数接受 Selection 对象并返回是否选中该列。
 */

export const isRowSelected = (rowIndex: number) => (selection: Selection) => {
	if (isCellSelection(selection)) {
		const map = TableMap.get(selection.$anchorCell.node(-1));

		return isRectSelected({
			left: 0,
			right: map.width,
			top: rowIndex,
			bottom: rowIndex + 1,
		})(selection);
	}

	return false;
};

/**
 * selectColumn
 * 作用：创建一个 ProseMirror 事务 (Transaction)，用于**选择表格的某一整列**。
 * 当用户点击列头部的选择器时，会调用此函数来更新编辑器的选中状态。
 *
 * @param columnIndex - 要选择的列的索引（从 0 开始）。
 * @returns 返回一个函数，该函数接受当前事务 (Transaction) 并返回一个新的设置了选中列的事务。
 */
export const selectColumn = (columnIndex: number) => (tr: Transaction) => {
	const table = findTable(tr.selection);
	if (table) {
		const map = TableMap.get(table.node);

		// 1. 获取目标列的所有单元格在 TableMap 中的索引
		const cells = map.cellsInRect({
			left: columnIndex,
			right: columnIndex + 1,
			top: 0,
			bottom: map.height,
		});

		if (cells.length > 0) {
			// 2. 计算 CellSelection 的起始 (head) 和结束 (anchor) 位置

			// head: 目标列中第一个单元格在文档中的绝对起始位置
			const head = table.start + cells[0];

			// anchor: 目标列中最后一个单元格在文档中的绝对起始位置
			const anchor = table.start + cells[cells.length - 1];

			// 3. 将绝对位置解析为 ProseMirror 的位置对象 ($anchor, $head)
			const $anchor = tr.doc.resolve(anchor);
			const $head = tr.doc.resolve(head);

			// 4. 创建并设置新的 CellSelection 事务
			// CellSelection 是专门用于选择表格中单元格的选中类型。
			return tr.setSelection(new CellSelection($anchor, $head));
		}
	}

	// 如果没有找到表格或单元格，返回原始事务，不进行操作。
	return tr;
};

/**
 * selectRow
 * 作用：创建一个 ProseMirror 事务 (Transaction)，用于**选择表格的某一整行**。
 * 当用户点击行左侧的选择器时，会调用此函数来更新编辑器的选中状态。
 *
 * @param rowIndex - 要选择的行的索引（从 0 开始）。
 * @returns 返回一个函数，该函数接受当前事务 (Transaction) 并返回一个新的设置了选中行的事务。
 */
export const selectRow = (rowIndex: number) => (tr: Transaction) => {
	// 1. 查找当前选区所在的表格
	const table = findTable(tr.selection);
	if (table) {
		const map = TableMap.get(table.node);

		// 2. 获取目标行 (rowIndex) 的所有单元格在 TableMap 中的索引
		// 我们定义一个覆盖目标行所有列的矩形区域
		const cells = map.cellsInRect({
			left: 0, // 从第 0 列开始
			right: map.width, // 到表格的最后一列
			top: rowIndex, // 目标行
			bottom: rowIndex + 1, // 目标行结束
		});

		if (cells.length > 0) {
			// 3. 计算 CellSelection 的起始 (head) 和结束 (anchor) 位置

			// head: 目标行中第一个单元格在文档中的绝对起始位置
			// cells[0] 总是目标行中的第一个单元格的相对位置
			const head = table.start + cells[0];

			// anchor: 目标行中最后一个单元格在文档中的绝对起始位置
			// cells[cells.length - 1] 总是目标行中的最后一个单元格的相对位置
			const anchor = table.start + cells[cells.length - 1];

			// 4. 将绝对位置解析为 ProseMirror 的位置对象 ($anchor, $head)
			const $anchor = tr.doc.resolve(anchor);
			const $head = tr.doc.resolve(head);

			// 5. 创建并设置新的 CellSelection 事务
			// CellSelection 是专门用于选择表格中单元格的选中类型。
			return tr.setSelection(new CellSelection($anchor, $head));
		}
	}

	// 如果没有找到表格或单元格，返回原始事务，不进行操作。
	return tr;
};

/**
 * 获取表格中指定列（或多列）的所有单元格节点及其位置信息。
 *
 * 作用：用于实现批量操作（如删除、复制、设置样式）时，准确获取目标列的所有单元格节点及其在文档中的位置。
 *
 * @param columnIndex - 要获取的列索引（可以是一个数字或数字数组）。
 * @returns 返回一个函数，该函数接受当前选区 (Selection)，并返回一个包含单元格位置和节点信息的数组，或 null。
 */
export const getCellsInColumn =
	(columnIndex: number | number[]) => (selection: Selection) => {
		const table = findTable(selection);

		if (table) {
			const map = TableMap.get(table.node);
			const indexes = Array.isArray(columnIndex) ? columnIndex : [columnIndex]; // 确保始终是数组

			// 定义单元格信息的类型，nodeAt 返回 Node | null
			type CellInfo = { pos: number; start: number; node: Node | null };

			return indexes.reduce(
				(acc: CellInfo[], index) => {
					// 显式类型化 acc 为 CellInfo 数组
					// 检查索引是否在有效范围内
					if (index >= 0 && index <= map.width - 1) {
						// 1. 获取目标列的所有单元格的相对位置
						const cellPositions = map.cellsInRect({
							left: index,
							right: index + 1,
							top: 0,
							bottom: map.height,
						});

						// 2. 将相对位置映射为包含节点信息的 CellInfo 数组
						const cellInfos: CellInfo[] = cellPositions.map((nodePos) => {
							const node = table.node.nodeAt(nodePos) as Node | null; // nodeAt 返回 Node | null
							const pos = nodePos + table.start; // 单元格在整个文档中的绝对起始位置

							return { pos, start: pos + 1, node }; // start 是单元格内容的起始位置
						});

						// 3. 使用 concat 累加结果。修正了 TypeScript 的类型兼容性问题。
						return acc.concat(cellInfos);
					}

					return acc;
				},
				// 修正初始值类型，明确 node 为 Node | null，不再包含 undefined
				[] as CellInfo[],
			);
		}

		// 如果未找到表格，返回 null
		return null;
	};
