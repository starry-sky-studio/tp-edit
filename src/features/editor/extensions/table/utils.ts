import { findParentNode } from "@tiptap/core";
import type { Node, ResolvedPos } from "@tiptap/pm/model";
import type { Selection, Transaction } from "@tiptap/pm/state";
import { CellSelection, type Rect, TableMap } from "@tiptap/pm/tables";

/**
 * 检查给定矩形区域的所有单元格是否都被当前 CellSelection 选中。
 * 常用于判断是否整列/整行/整表被选中。
 */
export const isRectSelected = (rect: Rect) => (selection: CellSelection) => {
	const map = TableMap.get(selection.$anchorCell.node(-1));
	const start = selection.$anchorCell.start(-1);
	const cells = map.cellsInRect(rect);
	const selectedCells = map.cellsInRect(
		map.rectBetween(
			selection.$anchorCell.pos - start,
			selection.$headCell.pos - start,
		),
	);

	for (let i = 0, count = cells.length; i < count; i += 1) {
		if (selectedCells.indexOf(cells[i]) === -1) {
			return false;
		}
	}

	return true;
};

/**
 * 从当前 Selection 向上查找 table 节点（tableRole === 'table'）。
 */
export const findTable = (selection: Selection) =>
	findParentNode(
		(node) => node.type.spec.tableRole && node.type.spec.tableRole === "table",
	)(selection);

/**
 * 类型保护：判断是否为 CellSelection。
 */
export const isCellSelection = (
	selection: Selection,
): selection is CellSelection => selection instanceof CellSelection;

/**
 * 判断指定列（columnIndex）是否被整列选中。
 */
export const isColumnSelected =
	(columnIndex: number) => (selection: Selection) => {
		if (isCellSelection(selection)) {
			const map = TableMap.get(selection.$anchorCell.node(-1));

			return isRectSelected({
				left: columnIndex,
				right: columnIndex + 1,
				top: 0,
				bottom: map.height,
			})(selection);
		}

		return false;
	};

/**
 * 判断指定行（rowIndex）是否被整行选中。
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
 * 判断整个表格是否被选中（整表选择）。
 */
export const isTableSelected = (selection: Selection) => {
	if (isCellSelection(selection)) {
		const map = TableMap.get(selection.$anchorCell.node(-1));

		return isRectSelected({
			left: 0,
			right: map.width,
			top: 0,
			bottom: map.height,
		})(selection);
	}

	return false;
};

/**
 * 判断选区中至少包含两个及以上的单元格。
 */
export const isAtLeastTwoCellsSelected = (selection: Selection) => {
	if (isCellSelection(selection)) {
		const map = TableMap.get(selection.$anchorCell.node(-1));
		const selectedCells = map.cellsInRect(
			map.rectBetween(
				selection.$anchorCell.pos - selection.$anchorCell.start(-1),
				selection.$headCell.pos - selection.$headCell.start(-1),
			),
		);

		return selectedCells.length >= 2;
	}

	return false;
};

/**
 * 获取表格中指定列（或多列）的所有单元格节点及其位置信息。
 */
export const getCellsInColumn =
	(columnIndex: number | number[]) => (selection: Selection) => {
		const table = findTable(selection);

		if (table) {
			const map = TableMap.get(table.node);
			const indexes = Array.isArray(columnIndex)
				? columnIndex
				: Array.from([columnIndex]);

			return indexes.reduce(
				(acc, index) => {
					if (index >= 0 && index <= map.width - 1) {
						const cells = map.cellsInRect({
							left: index,
							right: index + 1,
							top: 0,
							bottom: map.height,
						});

						return acc.concat(
							cells.map((nodePos) => {
								const node = table.node.nodeAt(nodePos);
								const pos = nodePos + table.start;

								return { pos, start: pos + 1, node };
							}),
						);
					}

					return acc;
				},
				[] as { pos: number; start: number; node: Node | null | undefined }[],
			);
		}

		return null;
	};

/**
 * 获取表格中指定行（或多行）的所有单元格节点及其位置信息。
 */
export const getCellsInRow =
	(rowIndex: number | number[]) => (selection: Selection) => {
		const table = findTable(selection);

		if (table) {
			const map = TableMap.get(table.node);
			const indexes = Array.isArray(rowIndex)
				? rowIndex
				: Array.from([rowIndex]);

			return indexes.reduce(
				(acc, index) => {
					if (index >= 0 && index <= map.height - 1) {
						const cells = map.cellsInRect({
							left: 0,
							right: map.width,
							top: index,
							bottom: index + 1,
						});

						return acc.concat(
							cells.map((nodePos) => {
								const node = table.node.nodeAt(nodePos);
								const pos = nodePos + table.start;

								return { pos, start: pos + 1, node };
							}),
						);
					}

					return acc;
				},
				[] as { pos: number; start: number; node: Node | null | undefined }[],
			);
		}

		return null;
	};

/**
 * 获取整个表格的所有单元格节点及其位置信息。
 */
export const getCellsInTable = (selection: Selection) => {
	const table = findTable(selection);

	if (table) {
		const map = TableMap.get(table.node);
		const cells = map.cellsInRect({
			left: 0,
			right: map.width,
			top: 0,
			bottom: map.height,
		});

		return cells.map((nodePos) => {
			const node = table.node.nodeAt(nodePos);
			const pos = nodePos + table.start;

			return { pos, start: pos + 1, node };
		});
	}

	return null;
};

/**
 * 从给定 ResolvedPos 向上查找满足谓词的父节点。
 * 返回该父节点的位置信息与深度等。
 */
export const findParentNodeClosestToPos = (
	$pos: ResolvedPos,
	predicate: (node: Node) => boolean,
) => {
	for (let i = $pos.depth; i > 0; i -= 1) {
		const node = $pos.node(i);

		if (predicate(node)) {
			return {
				pos: i > 0 ? $pos.before(i) : 0,
				start: $pos.start(i),
				depth: i,
				node,
			};
		}
	}

	return null;
};

/**
 * 从 $pos 开始向上查找最近的单元格（cell）节点。
 */
export const findCellClosestToPos = ($pos: ResolvedPos) => {
	const predicate = (node: Node) =>
		node.type.spec.tableRole && /cell/i.test(node.type.spec.tableRole);

	return findParentNodeClosestToPos($pos, predicate);
};

/**
 * 生成设置行/列选择的命令生成器。
 * select('row'|'column')(index)(tr) => 设置 CellSelection。
 */
const select =
	(type: "row" | "column") => (index: number) => (tr: Transaction) => {
		const table = findTable(tr.selection);
		const isRowSelection = type === "row";

		if (table) {
			const map = TableMap.get(table.node);

			// Check if the index is valid
			if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
				const left = isRowSelection ? 0 : index;
				const top = isRowSelection ? index : 0;
				const right = isRowSelection ? map.width : index + 1;
				const bottom = isRowSelection ? index + 1 : map.height;

				const cellsInFirstRow = map.cellsInRect({
					left,
					top,
					right: isRowSelection ? right : left + 1,
					bottom: isRowSelection ? top + 1 : bottom,
				});

				const cellsInLastRow =
					bottom - top === 1
						? cellsInFirstRow
						: map.cellsInRect({
								left: isRowSelection ? left : right - 1,
								top: isRowSelection ? bottom - 1 : top,
								right,
								bottom,
							});

				const head = table.start + cellsInFirstRow[0];
				const anchor = table.start + cellsInLastRow[cellsInLastRow.length - 1];
				const $head = tr.doc.resolve(head);
				const $anchor = tr.doc.resolve(anchor);

				return tr.setSelection(new CellSelection($anchor, $head));
			}
		}

		return tr;
	};

/** 将命令实例化为“选择列”。 */
export const selectColumn = select("column");

/** 将命令实例化为“选择行”。 */
export const selectRow = select("row");

/** 选择整个表格为 CellSelection。 */
export const selectTable = (tr: Transaction) => {
	const table = findTable(tr.selection);

	if (table) {
		const { map } = TableMap.get(table.node);

		if (map && map.length) {
			const head = table.start + map[0];
			const anchor = table.start + map[map.length - 1];
			const $head = tr.doc.resolve(head);
			const $anchor = tr.doc.resolve(anchor);

			return tr.setSelection(new CellSelection($anchor, $head));
		}
	}

	return tr;
};
