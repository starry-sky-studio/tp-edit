import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table/header";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { findTable, isColumnSelected, selectColumn } from "@/utils";
import { createAddColumnButton, createColumnsGrip } from "./index";

/**
 * TableHeader 扩展
 *
 * Tiptap/ProseMirror 的 TableHeader 扩展主要用于管理表格的头部单元格 (<th>)。
 * 在此代码中，我们扩展它，主要目的是通过 ProseMirror 插件机制，
 * 在表格顶部渲染出用于选择整列和添加新列的 UI 控件 (Grips/Buttons)。
 */
export const TableHeader = TiptapTableHeader.extend({
	/**
	 * addProseMirrorPlugins
	 * 作用：向 ProseMirror 视图添加自定义功能。这里添加一个插件来处理 UI 装饰器。
	 */
	addProseMirrorPlugins() {
		// 标记：用于阻止 ProseMirror 在执行选择操作时自动滚动视图。
		// 这对于防止点击 Grip 按钮时页面乱跳非常重要。
		let suppressScrollToSelection = false;

		// 轻量 Hover 状态：记录鼠标悬停所在表格的文档位置（用于在 hover 时也显示头部装饰器）
		const hoverPluginKey = new PluginKey<{ hoveredTablePos: number | null }>(
			"tableHeaderHover",
		);

		return [
			new Plugin({
				key: hoverPluginKey,
				state: {
					init: (): { hoveredTablePos: number | null } => ({
						hoveredTablePos: null,
					}),
					apply(
						tr,
						value: { hoveredTablePos: number | null },
						_oldState,
						_newState,
					): { hoveredTablePos: number | null } {
						const meta = tr.getMeta(hoverPluginKey as any) as
							| { hoveredTablePos: number | null }
							| undefined;
						if (meta && "hoveredTablePos" in meta) {
							return { hoveredTablePos: meta.hoveredTablePos };
						}
						return value;
					},
				},
				props: {
					/**
					 * handleScrollToSelection
					 * 作用：拦截滚动到选区的默认行为。
					 */
					handleScrollToSelection: () => {
						if (suppressScrollToSelection) {
							suppressScrollToSelection = false;
							return true; // 拦截滚动
						}
						return false; // 允许默认滚动
					},

					// 监听容器级鼠标事件，追踪 hover 的表格位置
					handleDOMEvents: {
						mousemove: (view, event) => {
							const e = event as MouseEvent;
							const target = e.target as HTMLElement | null;
							const tableEl = target?.closest?.("table") as HTMLElement | null;
							const current =
								hoverPluginKey.getState(view.state)?.hoveredTablePos ?? null;
							if (!tableEl) {
								if (current !== null) {
									const tr = view.state.tr.setMeta(hoverPluginKey, {
										hoveredTablePos: null,
									});
									view.dispatch(tr);
								}
								return false;
							}
							const posInfo = view.posAtCoords({
								left: e.clientX,
								top: e.clientY,
							});
							if (!posInfo) return false;
							if (posInfo.pos !== current) {
								const tr = view.state.tr.setMeta(hoverPluginKey, {
									hoveredTablePos: posInfo.pos,
								});
								view.dispatch(tr);
							}
							return false;
						},
						mouseleave: (view) => {
							const current =
								hoverPluginKey.getState(view.state)?.hoveredTablePos ?? null;
							if (current !== null) {
								const tr = view.state.tr.setMeta(hoverPluginKey, {
									hoveredTablePos: null,
								});
								view.dispatch(tr);
							}
							return false;
						},
					},

					/**
					 * decorations
					 * 作用：根据当前编辑器状态 (state) 返回一组需要在视图中渲染的装饰器 (UI 元素)。
					 * 装饰器是一种 ProseMirror 机制，允许在不改变文档结构的情况下，在文档周围添加自定义 DOM 元素。
					 */
					decorations: (state) => {
						const { isEditable } = this.editor;

						// 如果编辑器不可编辑，则不显示任何 UI 控件。
						if (!isEditable) {
							return DecorationSet.empty;
						}

						const { doc, selection } = state;
						const hoveredTablePos =
							hoverPluginKey.getState(state)?.hoveredTablePos ?? null;
						const decorations: Decoration[] = [];
						// 查找当前光标或选区所在的表格节点。
						let tableNode = findTable(selection);
						// 若无选中表格，但有 hover 的表格位置，则基于 hover 位置解析表格
						if (!tableNode && hoveredTablePos !== null) {
							try {
								const $pos = doc.resolve(hoveredTablePos);
								const selAtHover = TextSelection.near($pos);
								tableNode = findTable(selAtHover);
							} catch {}
						}

						// 只有当存在表格时，才渲染列操作控件
						if (tableNode) {
							// TableMap: 获取表格的二维布局信息，用于准确找到每个单元格的位置。
							const map = TableMap.get(tableNode.node);

							// 遍历表格的每一列 (map.width 是列数)
							for (let index = 0; index < map.width; index += 1) {
								const firstRow = 0;
								// 计算第一行中，当前列 (index) 的单元格在文档中的绝对起始位置。
								const cellPosInDoc =
									tableNode.start + map.map[firstRow * map.width + index];
								const pos = cellPosInDoc;

								// widget 装饰器通常附加在位置 pos + 1 处，即节点开始标记之后（内容起始处）。

								// 1) grip 装饰器：负责整列选择的 UI (Column Grip)
								const gripDeco = Decoration.widget(pos + 1, () => {
									// 检查当前列是否被选中，用于设置选中样式。
									const colSelected = isColumnSelected(index)(selection);
									let className = "grip-column";
									if (colSelected) className += " selected";
									if (index === 0) className += " first";
									if (index === map.width - 1) className += " last";

									return createColumnsGrip({
										className,
										selected: colSelected,
										onMouseDown: () => {
											// 鼠标按下时，设置标记以阻止滚动。
											suppressScrollToSelection = true;
											// 派发事务，执行选择整列的命令。
											this.editor.view.dispatch(
												selectColumn(index)(this.editor.state.tr),
											);
											// 异步取消阻止滚动标记。
											setTimeout(() => {
												suppressScrollToSelection = false;
											}, 0);
										},
									});
								});
								decorations.push(gripDeco);

								// 2) pseudo 装饰器：负责“添加列”按钮（在当前列之前插入）
								const addBtnDeco = Decoration.widget(pos + 1, () => {
									const { element } = createAddColumnButton({
										index, // 传递当前列索引，默认在当前列之前插入
										className: "grip-pseudo",
										style: {},
										editor: this.editor,
									});
									return element;
								});
								decorations.push(addBtnDeco);

								// 3) 针对最后一列：再添加一个“添加列”按钮（在表格末尾插入）
								if (index === map.width - 1) {
									const addBtnDeco = Decoration.widget(pos + 1, () => {
										const { element } = createAddColumnButton({
											index: index + 1, // 传递列数+1，表示在最后一列之后插入
											className: "grip-pseudo",
											style: {
												right: "-3%", // 调整位置使其显示在表格最右侧
												left: "auto",
											},
											editor: this.editor,
										});
										return element;
									});
									decorations.push(addBtnDeco);
								}
							}
						}

						// 返回最终的装饰器集合
						return DecorationSet.create(doc, decorations);
					},
				},
			}),
		];
	},
});

export default TableHeader;
