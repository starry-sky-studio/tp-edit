import { findParentNode } from "@tiptap/core";
import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table/header";
import type { Selection, Transaction } from "@tiptap/pm/state";
import { Plugin } from "@tiptap/pm/state";
import type { Rect } from "@tiptap/pm/tables";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// 表格工具函数（简化版）
const findTable = (selection: Selection) =>
	findParentNode((node) => node.type.spec.tableRole === "table")(selection);

const isCellSelection = (selection: Selection): selection is CellSelection =>
	selection instanceof CellSelection;

const isRectSelected = (rect: Rect) => (selection: CellSelection) => {
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

const isColumnSelected = (columnIndex: number) => (selection: Selection) => {
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

// 行选择：判断某一行是否被整体选中
const isRowSelected = (rowIndex: number) => (selection: Selection) => {
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

const getCellsInRow = (rowIndex: number) => (selection: Selection) => {
	const table = findTable(selection);

	if (table) {
		const map = TableMap.get(table.node);

		if (rowIndex >= 0 && rowIndex <= map.height - 1) {
			const cells = map.cellsInRect({
				left: 0,
				right: map.width,
				top: rowIndex,
				bottom: rowIndex + 1,
			});

			return cells.map((nodePos) => {
				const node = table.node.nodeAt(nodePos);
				const pos = nodePos + table.start;

				return { pos, start: pos + 1, node };
			});
		}
	}

	return null;
};

const selectColumn = (columnIndex: number) => (tr: Transaction) => {
	const table = findTable(tr.selection);
	if (table) {
		const map = TableMap.get(table.node);
		const cells = map.cellsInRect({
			left: columnIndex,
			right: columnIndex + 1,
			top: 0,
			bottom: map.height,
		});

		if (cells.length > 0) {
			const head = table.start + cells[0];
			const anchor = table.start + cells[cells.length - 1];
			const $anchor = tr.doc.resolve(anchor);
			const $head = tr.doc.resolve(head);

			return tr.setSelection(new CellSelection($anchor, $head));
		}
	}

	return tr;
};

// 选择整行
const selectRow = (rowIndex: number) => (tr: Transaction) => {
	const table = findTable(tr.selection);
	if (table) {
		const map = TableMap.get(table.node);
		const cells = map.cellsInRect({
			left: 0,
			right: map.width,
			top: rowIndex,
			bottom: rowIndex + 1,
		});

		if (cells.length > 0) {
			const head = table.start + cells[0];
			const anchor = table.start + cells[cells.length - 1];
			const $anchor = tr.doc.resolve(anchor);
			const $head = tr.doc.resolve(head);

			return tr.setSelection(new CellSelection($anchor, $head));
		}
	}

	return tr;
};

// TableHeader 扩展：
// - 仅用于渲染列头部的操作 grip（选择整列），不要求文档中存在 tableHeader 节点
// - 基于 decorations 在第一行每个单元格上方插入绝对定位的交互区
export const TableHeader = TiptapTableHeader.extend({
	addProseMirrorPlugins() {
		// 标记：由列/行 grip 触发的选择，抑制滚动到选区
		let suppressScrollToSelection = false;
		return [
			new Plugin({
				props: {
					handleScrollToSelection: () => {
						if (suppressScrollToSelection) {
							suppressScrollToSelection = false;
							return true; // 阻止默认滚动
						}
						return false;
					},
					decorations: (state) => {
						const { isEditable } = this.editor;

						if (!isEditable) {
							return DecorationSet.empty;
						}

						const { doc, selection } = state;
						const decorations: Decoration[] = [];
						const tableNode = findTable(selection);

						// 列头 grips：基于 TableMap 列数稳定渲染，避免因单元格合并导致索引错位
						if (tableNode) {
							const map = TableMap.get(tableNode.node);
							console.log(map, "map1");
							for (let index = 0; index < map.width; index += 1) {
								const firstRow = 0;
								const cellPosInDoc =
									tableNode.start + map.map[firstRow * map.width + index];
								const pos = cellPosInDoc;
								decorations.push(
									Decoration.widget(pos + 1, () => {
										const colSelected = isColumnSelected(index)(selection);
										let className = "grip-column";

										if (colSelected) {
											className += " selected";
										}

										if (index === 0) {
											className += " first";
										}

										if (index === map.width - 1) {
											className += " last";
										}

										const grip = document.createElement("a");

										// 参考 DocFlow 样式：固定在表格顶边 (-12px) 的列头 grip
										grip.style.cssText = `
											position: absolute;
											top: -12px;
											left: 0;
											right: -1px;
											height: 12px;
											background-color: #f5f5f5;
											border-right: 1px solid oklch(0.922 0 0);
											opacity: 0;
											transition: opacity 0.2s ease;
											pointer-events: auto;
											cursor: pointer;
											text-decoration: none;
										`;

										grip.className = className;

										//grip 元素里面添加个伪类元素
										// 添加伪类元素：列选择指示器
										const pseudoElement = document.createElement("div");
										pseudoElement.style.cssText = `
											position: absolute;
											top: -50%;
											left: 0%;
											transform: translate(-50%, -50%);
											width: 6px;
											height: 6px;
											background-color: pink;
											border-radius: 50%;
											opacity: 1;
											transition: all 0.2s ease;
											overflow: visible;
										`;
										pseudoElement.className = "grip-indicator";

										//如果是最后一个元素 则 单独再添加一个伪类元素 最后一个元素的伪类元素 需要单独设置样式
										if (index === map.width - 1) {
											// 再添加一个指示器
											const lastIndicator = document.createElement("div");
											lastIndicator.style.cssText = `
												position: absolute;
										    top: -50%;
												right: 0%;
												transform: translate(50%, -50%);
												width: 6px;
												height: 6px;
												background-color: pink;
												border-radius: 50%;
												opacity: 1;
												transition: all 0.2s ease;
											`;
											lastIndicator.className = "grip-last-indicator";
											grip.appendChild(lastIndicator);
										}

										// 将伪类元素添加到 grip 中
										grip.appendChild(pseudoElement);

										// 检查是否在表格内或选中状态：编辑或选择时常显，离开时按悬停控制
										const shouldShow =
											colSelected ||
											(selection.$anchor && findTable(selection)) ||
											(selection.$head && findTable(selection));

										if (shouldShow) {
											grip.style.opacity = "1";
											// 选中整列时高亮为蓝色
											if (colSelected) {
												grip.style.backgroundColor = "#3b82f6";
											}
										}

										// 悬停显示效果
										grip.addEventListener("mouseenter", () => {
											pseudoElement.style.opacity = "1";
											pseudoElement.style.transform =
												"translate(-50%, -50%) scale(1.2)";
											// 如果是最后一列，同时更新最后一个指示器
											if (index === map.width - 1) {
												const lastIndicator = grip.querySelector(
													".grip-last-indicator",
												) as HTMLElement;
												if (lastIndicator) {
													lastIndicator.style.opacity = "1";
													lastIndicator.style.transform =
														"translate(50%, -50%) scale(1.3)";
												}
											}
										});

										grip.addEventListener("mouseleave", () => {
											pseudoElement.style.opacity = "1";
											pseudoElement.style.transform =
												"translate(-50%, -50%) scale(1)";
											// 如果是最后一列，同时更新最后一个指示器
											if (index === map.width - 1) {
												const lastIndicator = grip.querySelector(
													".grip-last-indicator",
												) as HTMLElement;
												if (lastIndicator) {
													lastIndicator.style.opacity = "1";
													lastIndicator.style.transform =
														"translate(50%, -50%) scale(1)";
												}
											}
										});

										grip.addEventListener("mousedown", (event) => {
											event.preventDefault();
											event.stopImmediatePropagation();
											suppressScrollToSelection = true;
											this.editor.view.dispatch(
												selectColumn(index)(this.editor.state.tr),
											);
											// 点击后立即给予视觉高亮
											grip.style.backgroundColor = "#3b82f6";
											// 更新伪类元素状态
											pseudoElement.style.backgroundColor = "#fff";
											pseudoElement.style.transform =
												"translate(-50%, -50%) scale(1.5)";
											// 如果是最后一列，同时更新最后一个指示器
											if (index === map.width - 1) {
												const lastIndicator = grip.querySelector(
													".grip-last-indicator",
												) as HTMLElement;
												if (lastIndicator) {
													lastIndicator.style.backgroundColor = "#fff";
													lastIndicator.style.transform =
														"translate(50%, -50%) scale(1.8)";
													lastIndicator.style.borderColor = "#3b82f6";
												}
											}
											setTimeout(() => {
												suppressScrollToSelection = false;
											}, 0);
											// 点按钮：在该列前插入一列
										});

										return grip;
									}),
								);
							}
						}

						return DecorationSet.create(doc, decorations);
					},
				},
			}),
		];
	},
});

export default TableHeader;
