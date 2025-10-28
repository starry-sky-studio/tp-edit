import { findParentNode } from "@tiptap/core";
import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table/header";
import type { Selection, Transaction } from "@tiptap/pm/state";
import { NodeSelection, Plugin } from "@tiptap/pm/state";
import type { Rect } from "@tiptap/pm/tables";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { createTooltipElement } from "./AddItem";
import { createGrip } from "./TableOperate";

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

// TableHeader 扩展：
// - 仅用于渲染列头部的操作 grip（选择整列），不要求文档中存在 tableHeader 节点
// - 基于 decorations 在第一行每个单元格上方插入绝对定位的交互区
export const TableHeader = TiptapTableHeader.extend({
	addProseMirrorPlugins() {
		// 标记：由列/行 grip 触发的选择，抑制滚动到选区
		let suppressScrollToSelection = false;
		// 自定义头部操作按钮的显示状态
		// let showCustomHeader = false;

		// 监听自定义事件，显示/隐藏自定义头部操作按钮
		// document.addEventListener("tableHover", (event: any) => {
		// 	const { table, show } = event.detail;
		// 	showCustomHeader = show;
		// 	// 强制重新渲染装饰器
		// 	this.editor.view.dispatch(this.editor.state.tr);
		// });

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
					// 当鼠标划过 table的时候 这个装饰器 也要显示出来
					decorations: (state) => {
						const { isEditable } = this.editor;

						if (!isEditable) {
							return DecorationSet.empty;
						}

						const { doc, selection } = state;
						const decorations: Decoration[] = [];
						const tableNode = findTable(selection);

						// 检测表格状态
						const isTableSelected =
							selection instanceof NodeSelection &&
							selection.node?.type.name === "table";
						const isInTable = tableNode !== null;

						// 为表格添加活跃状态的 CSS 类
						if (tableNode && (isTableSelected || isInTable)) {
							const tablePos = tableNode.start;
							decorations.push(
								Decoration.node(tablePos, tablePos + tableNode.node.nodeSize, {
									class: isTableSelected ? "selected" : "active",
								}),
							);
						}

						// 列头 grips：基于 TableMap 列数稳定渲染，避免因单元格合并导致索引错位
						if (tableNode) {
							const map = TableMap.get(tableNode.node);
							console.log(map, "map1");
							for (let index = 0; index < map.width; index += 1) {
								const firstRow = 0;
								const cellPosInDoc =
									tableNode.start + map.map[firstRow * map.width + index];
								const pos = cellPosInDoc;
								// 1) grip 装饰器：负责整列选择
								const gripDeco = Decoration.widget(pos + 1, () => {
									const colSelected = isColumnSelected(index)(selection);
									let className = "grip-column";
									if (colSelected) className += " selected";
									if (index === 0) className += " first";
									if (index === map.width - 1) className += " last";

									return createGrip({
										className,
										selected: colSelected,
										onMouseDown: () => {
											suppressScrollToSelection = true;
											this.editor.view.dispatch(
												selectColumn(index)(this.editor.state.tr),
											);
											setTimeout(() => {
												suppressScrollToSelection = false;
											}, 0);
										},
									});
								});
								decorations.push(gripDeco);

								// 2) pseudo 装饰器：负责“添加列”按钮（相互独立，不嵌入 grip）
								const addBtnDeco = Decoration.widget(pos + 1, () => {
									const { element } = createTooltipElement({
										text: "添加列",
										index,
										className: "grip-pseudo",
										style: {},
										editor: this.editor,
									});
									// 默认可见度由 CSS/事件控制
									return element;
								});
								decorations.push(addBtnDeco);

								//如果是最后一个元素 则再添加一个添加列的按钮
								if (index === map.width - 1) {
									const addBtnDeco = Decoration.widget(pos + 1, () => {
										const { element } = createTooltipElement({
											text: "添加列",
											index: index + 1,
											className: "grip-pseudo",
											style: {
												top: "-20px",
												right: "-3%",
												left: "auto",
											},
											editor: this.editor,
										});
										// 默认可见度由 CSS/事件控制
										return element;
									});
									decorations.push(addBtnDeco);
								}
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
