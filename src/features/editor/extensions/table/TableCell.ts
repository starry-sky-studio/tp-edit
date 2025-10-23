import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { getCellsInColumn, isRowSelected, selectRow } from "./utils";

/**
 * 表格单元格选项接口
 * 用于配置单元格的 HTML 属性
 */
export interface TableCellOptions {
	HTMLAttributes: Record<string, any>;
}

/**
 * 表格单元格扩展
 *
 * 功能说明：
 * 1. 定义表格单元格的基本结构和属性
 * 2. 支持 colspan、rowspan、colwidth 等表格属性
 * 3. 在第一列添加行选择器（红色/绿色 grip）
 * 4. 提供行选择功能，点击 grip 可选择整行
 *
 * 技术实现：
 * - 使用 ProseMirror Node 系统定义单元格节点
 * - 通过装饰器在第一列添加交互元素
 * - 支持表格的合并单元格功能
 */
export const TableCell = Node.create<TableCellOptions>({
	name: "tableCell",

	// 单元格内容：必须包含至少一个块级元素
	content: "block+", // TODO: Do not allow table in table

	// 表格角色：标识这是一个单元格
	tableRole: "cell",

	// 隔离模式：单元格内容独立，不受外部影响
	isolating: true,

	/**
	 * 添加选项配置
	 * 返回单元格的默认配置选项
	 */
	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	/**
	 * HTML 解析规则
	 * 定义如何从 HTML 中解析单元格节点
	 */
	parseHTML() {
		return [{ tag: "td" }];
	},

	/**
	 * HTML 渲染规则
	 * 定义如何将单元格节点渲染为 HTML
	 *
	 * @param HTMLAttributes 单元格的 HTML 属性
	 * @returns HTML 渲染结果
	 */
	renderHTML({ HTMLAttributes }) {
		return [
			"td", // HTML 标签名
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), // 合并属性
			0, // 子节点位置
		];
	},

	/**
	 * 添加单元格属性
	 * 定义单元格支持的所有属性
	 */
	addAttributes() {
		return {
			// 列跨度：单元格跨越的列数
			colspan: {
				default: 1,
				parseHTML: (element) => {
					const colspan = element.getAttribute("colspan");
					const value = colspan ? parseInt(colspan, 10) : 1;
					return value;
				},
			},

			// 行跨度：单元格跨越的行数
			rowspan: {
				default: 1,
				parseHTML: (element) => {
					const rowspan = element.getAttribute("rowspan");
					const value = rowspan ? parseInt(rowspan, 10) : 1;
					return value;
				},
			},

			// 列宽度：单元格的宽度设置
			colwidth: {
				default: null,
				parseHTML: (element) => {
					const colwidth = element.getAttribute("colwidth");
					const value = colwidth ? [parseInt(colwidth, 10)] : null;
					return value;
				},
			},

			// 样式：自定义 CSS 样式
			style: {
				default: null,
			},
		};
	},

	/**
	 * 添加 ProseMirror 插件
	 * 为表格单元格添加行选择器功能和表格悬停检测
	 */
	addProseMirrorPlugins() {
		return [
			new Plugin({
				props: {
					/**
					 * 装饰器函数
					 * 在第一列的每个单元格左侧添加行选择器
					 * 检测表格悬停状态并显示自定义 tableHeader
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
						const decorations: Decoration[] = [];

						// 检查是否在表格内
						const tableNode = selection.$anchor.node(-1);
						if (tableNode && tableNode.type.name === "table") {
							// 在表格上方添加自定义 tableHeader
							const tablePos = selection.$anchor.start(-1);
							decorations.push(
								Decoration.widget(tablePos, () => {
									const header = document.createElement("div");
									header.className = "custom-table-header";
									header.style.cssText = `
										position: absolute;
										top: -50px;
										left: 0;
										right: 0;
										height: 40px;
										background-color: #f5f5f5;
										border: 1px solid #ddd;
										display: flex;
										align-items: center;
										justify-content: space-between;
										padding: 0 10px;
										z-index: 1000;
										opacity: 0;
										transition: opacity 0.2s ease;
									`;

									// 添加表格操作按钮
									const addRowBtn = document.createElement("button");
									addRowBtn.textContent = "添加行";
									addRowBtn.style.cssText = `
										padding: 5px 10px;
										background-color: #007bff;
										color: white;
										border: none;
										border-radius: 4px;
										cursor: pointer;
									`;

									const addColBtn = document.createElement("button");
									addColBtn.textContent = "添加列";
									addColBtn.style.cssText = `
										padding: 5px 10px;
										background-color: #28a745;
										color: white;
										border: none;
										border-radius: 4px;
										cursor: pointer;
									`;

									header.appendChild(addRowBtn);
									header.appendChild(addColBtn);

									// 添加鼠标悬停效果
									header.addEventListener("mouseenter", () => {
										header.style.opacity = "1";
									});

									header.addEventListener("mouseleave", () => {
										header.style.opacity = "0";
									});

									return header;
								}),
							);
						}

						// 获取第一列的所有单元格
						const cells = getCellsInColumn(0)(selection);

						if (cells) {
							// 为第一列的每个单元格创建行选择器
							cells.forEach(({ pos }: { pos: number }, index: number) => {
								decorations.push(
									Decoration.widget(pos + 1, () => {
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

										// 创建行选择器元素
										const grip = document.createElement("a");
										grip.className = className;

										// 设置行选择器样式
										grip.style.cssText = `
											position: absolute;
											left: -12px;
											top: 0;
											width: 12px;
											height: 100%;
											background-color: red;
											border-bottom: 1px solid oklch(0.922 0 0);
										`;

										// 创建额外的装饰元素（绿色小条）
										const grip1 = document.createElement("a");
										grip1.style.cssText = `
											position: absolute;
											left: -12px;
											top: 0;
											width: 12px;
											height: 12%;
											background-color: green;
											border-bottom: 1px solid oklch(0.922 0 0);
										`;

										// 添加点击事件监听器
										grip.addEventListener("mousedown", (event) => {
											event.preventDefault();
											event.stopImmediatePropagation();

											// 选择整行
											this.editor.view.dispatch(
												selectRow(index)(this.editor.state.tr),
											);
										});

										return grip;
									}),
								);
							});
						}

						// 创建并返回装饰器集合
						return DecorationSet.create(doc, decorations);
					},
				},
			}),
		];
	},
});
