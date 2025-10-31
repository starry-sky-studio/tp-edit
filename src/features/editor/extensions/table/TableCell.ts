import { mergeAttributes } from "@tiptap/core";
import { TableCell as TiptapTableCell } from "@tiptap/extension-table"; // 引入官方的 TableCell 扩展
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { getCellsInColumn, isRowSelected, selectRow } from "@/utils";
import { createAddRowButton, createColumnsGrip } from "./index"; // 导入实际的工具函数

/**
 * 表格单元格选项接口
 */
export interface TableCellOptions {
	HTMLAttributes: Record<string, any>;
}

/**
 * 表格单元格扩展 (重构为继承官方扩展)
 *
 * 我们继承 Tiptap 的 TableCell 扩展，只覆盖需要自定义的部分，
 * 例如 addProseMirrorPlugins 来添加行选择器。
 */
export const TableCell = TiptapTableCell.extend<TableCellOptions>({
	/**
	 * 覆盖 addOptions 来设置自定义选项，同时调用父级默认选项
	 */
	addOptions() {
		return {
			...this.parent?.(), // 继承父级的默认选项
			HTMLAttributes: {},
		};
	},

	/**
	 * 覆盖 renderHTML 来合并自定义属性，确保 td 标签的渲染是正确的
	 */
	renderHTML({ node, HTMLAttributes }) {
		// 调用父级的 renderHTML，确保 ProseMirror Table 库需要的属性（如 colspan/rowspan）被正确处理
		const parentRender = this.parent?.({ node, HTMLAttributes });

		if (
			parentRender &&
			Array.isArray(parentRender) &&
			parentRender[0] === "td"
		) {
			return [
				"td",
				mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), // 合并自定义属性
				0,
			];
		}

		return [
			"td",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		];
	},

	/**
	 * 覆盖 addProseMirrorPlugins
	 * 为表格单元格添加行选择器功能和表格悬停检测
	 */
	addProseMirrorPlugins() {
		// 轻量 Hover 状态：记录鼠标悬停所在表格的文档位置（用于在 hover 时也显示行装饰器）
		const hoverPluginKey = new PluginKey<{ hoveredTablePos: number | null }>(
			"tableCellHover",
		);

		return [
			// 必须保留父级插件，通常是 prosemirror-tables 相关的插件
			...(this.parent?.() || []),

			new Plugin({
				key: hoverPluginKey,
				state: {
					init: (): { hoveredTablePos: number | null } => ({
						hoveredTablePos: null,
					}),
					apply(
						tr,
						value: { hoveredTablePos: number | null },
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
					handleDOMEvents: (() => {
						let hideTimer: number | null = null;
						let mode: "idle" | "table" | "decorator" | "hidePending" = "idle";

						const clearHideTimer = () => {
							if (hideTimer !== null) {
								window.clearTimeout(hideTimer);
								hideTimer = null;
							}
						};

						const scheduleHide = (view: any) => {
							clearHideTimer();
							mode = "hidePending";
							hideTimer = window.setTimeout(() => {
								const current =
									hoverPluginKey.getState(view.state)?.hoveredTablePos ?? null;
								if (current !== null) {
									const tr = view.state.tr.setMeta(hoverPluginKey, {
										hoveredTablePos: null,
									});
									view.dispatch(tr);
								}
								mode = "idle";
								hideTimer = null;
							}, 200);
						};

						const isDecorator = (el: Element | null) => {
							if (!el) return false;
							return (
								(el as HTMLElement).closest(".grip-row") !== null ||
								(el as HTMLElement).closest(".grip-pseudo") !== null
							);
						};

						return {
							mousemove: (view, event) => {
								const e = event as MouseEvent;
								const target = e.target as HTMLElement | null;
								const tableEl = target?.closest?.(
									"table",
								) as HTMLElement | null;
								const overDecorator = isDecorator(target);
								const current =
									hoverPluginKey.getState(view.state)?.hoveredTablePos ?? null;

								if (tableEl) {
									clearHideTimer();
									mode = "table";
									const posInfo = view.posAtCoords({
										left: e.clientX,
										top: e.clientY,
									});
									if (posInfo && posInfo.pos !== current) {
										const tr = view.state.tr.setMeta(hoverPluginKey, {
											hoveredTablePos: posInfo.pos,
										});
										view.dispatch(tr);
									}
									return false;
								}

								if (overDecorator) {
									clearHideTimer();
									mode = "decorator";
									return false;
								}

								scheduleHide(view);
								return false;
							},
							mouseleave: (view) => {
								scheduleHide(view);
								return false;
							},
						};
					})(),
					/**
					 * 装饰器函数：在第一列的每个单元格左侧添加行选择器
					 *
					 * @param state ProseMirror 状态
					 * @returns 装饰器集合
					 */
					decorations: (state) => {
						const { isEditable } = this.editor;

						// 如果编辑器不可编辑，不显示装饰器
						if (!isEditable) {
							return DecorationSet.empty;
						}

						const { doc, selection } = state;
						const hoveredTablePos =
							hoverPluginKey.getState(state)?.hoveredTablePos ?? null;
						let effectiveSelection = selection;
						// 若当前选区不在表格中且存在 hover 表格位置，则基于 hover 位置构造临时选区
						if (!getCellsInColumn(0)(selection) && hoveredTablePos !== null) {
							try {
								const $pos = doc.resolve(hoveredTablePos);
								effectiveSelection = TextSelection.near($pos);
							} catch {}
						}
						const decorations: Decoration[] = [];

						// --------------------------------------------------------------------------------
						// 注意: 表格头部的逻辑 (custom-table-header) 应该放在 Table 扩展中，而不是 TableCell。
						// 单元格装饰器只关注单元格本身和行/列的 grips。
						// 为了简化，此处只保留行 grip 逻辑。
						// --------------------------------------------------------------------------------

						// 获取第一列的所有单元格
						const cells = getCellsInColumn(0)(effectiveSelection);

						if (cells && Array.isArray(cells)) {
							// 为第一列的每个单元格创建行选择器和添加行按钮
							cells.forEach(({ pos }: { pos: number }, index: number) => {
								// 检查当前行是否被选中
								const rowSelected = isRowSelected(index)(selection);

								// 构建 CSS 类名
								let className = "grip-row";
								if (rowSelected) {
									className += " selected";
								}
								if (index === 0) {
									className += " first";
								}
								if (index === cells.length - 1) {
									className += " last";
								}

								// 1) 行选择器装饰器 - 使用 createRowGrip 替代手动 DOM 创建
								decorations.push(
									Decoration.widget(pos + 1, () => {
										return createColumnsGrip({
											className,
											selected: rowSelected,
											onMouseDown: (event: MouseEvent) => {
												event.preventDefault();
												event.stopImmediatePropagation();
												// 选择整行
												this.editor.view.dispatch(
													selectRow(index)(this.editor.state.tr),
												);
											},

											styleOverrides: {
												left: "-12px",
												top: "0",
												right: "auto",
												width: "12px",
												height: "102%",
												borderBottom: "1px solid oklch(0.922 0 0)",
												borderRight: "none",
											},
										});
									}),
								);

								// 2) 添加行按钮装饰器（相互独立，不嵌入 grip）
								// 使用侧边定位避免影响光标位置
								const addRowDeco = Decoration.widget(
									pos + 1,
									() => {
										const { element } = createAddRowButton({
											index: index,
											className: "grip-pseudo",
											style: {
												top: "0%",
												left: "-18px",
												position: "absolute",
												pointerEvents: "auto",
											},
											editor: this.editor,
										});
										// 确保不影响文档流
										element.style.position = "absolute";
										element.style.zIndex = "10";
										return element;
									},
									{ side: -1 },
								); // 使用 side: -1 避免光标偏移
								decorations.push(addRowDeco);

								//如果是最后一行 再添加格 添加行的
								if (index === cells.length - 1) {
									const addRowDeco = Decoration.widget(
										pos + 1,
										() => {
											const { element } = createAddRowButton({
												index: index + 1,
												className: "grip-pseudo",
												style: {
													top: "auto",
													bottom: "-5px",
													left: "-18px",
													position: "absolute",
													pointerEvents: "auto",
												},
												editor: this.editor,
											});
											// 确保不影响文档流
											element.style.position = "absolute";
											element.style.zIndex = "10";
											return element;
										},
										{ side: -1 },
									); // 使用 side: -1 避免光标偏移
									decorations.push(addRowDeco);
								}
							});
						}

						return DecorationSet.create(doc, decorations);
					},
				},
			}),
		];
	},
});
