// import { Extension } from "@tiptap/core";
// import { CellSelection, TableMap } from "@tiptap/pm/tables";
// import { Plugin, PluginKey } from "prosemirror-state";
// import { Decoration, DecorationSet } from "prosemirror-view";

// /**
//  * 表格插入点扩展
//  *
//  * 功能说明：
//  * 1. 在表格的第一行顶部显示"插入列"的圆点按钮
//  * 2. 在表格的第一列左侧显示"插入行"的圆点按钮
//  * 3. 悬停时显示气泡提示和"+"按钮
//  * 4. 点击可快速插入行/列
//  *
//  * 技术实现：
//  * - 使用 ProseMirror Plugin 系统
//  * - 通过 Decoration.widget 在表格边界渲染交互元素
//  * - 使用绝对定位让元素溢出到表格外部
//  * - 延迟计算装饰器，避免干扰表格创建过程
//  */
// export const InsertHandles = Extension.create({
// 	name: "insertHandles",

// 	addProseMirrorPlugins() {
// 		const key = new PluginKey("insert-handles");

// 		return [
// 			new Plugin<{ decorations: DecorationSet | null }>({
// 				key,
// 				state: {
// 					init: (_config, state) => {
// 						// 初始化时返回空装饰器，避免干扰表格创建
// 						return { decorations: DecorationSet.empty };
// 					},
// 					apply: (tr, prev, _oldState, newState) => {
// 						// 检查是否是表格创建操作
// 						const isTableCreation = tr.steps.some((step) => {
// 							// 检查步骤是否涉及表格节点
// 							return (
// 								(step as { constructor?: { name?: string } }).constructor
// 									?.name === "AddNodeMarkStep" ||
// 								(step as { constructor?: { name?: string } }).constructor
// 									?.name === "ReplaceAroundStep" ||
// 								(step as any).type?.name === "table" ||
// 								(step as any).nodeType?.name === "table"
// 							);
// 						});

// 						// 如果是表格创建，延迟添加装饰器
// 						if (isTableCreation) {
// 							console.log("表格创建中，延迟添加装饰器");
// 							// 延迟计算，确保表格完全创建后再显示插入点
// 							setTimeout(() => {
// 								// 通过触发一个空的选择变化来更新装饰器
// 								const editor = (newState as any).editor;
// 								if (editor) {
// 									console.log("延迟触发装饰器更新");
// 									editor.view.dispatch(
// 										editor.state.tr.setSelection(editor.state.selection),
// 									);
// 								}
// 							}, 300);
// 							return { decorations: DecorationSet.empty };
// 						}

// 						// 只在选择变化且不是表格创建时计算装饰器
// 						if (tr.selectionSet && !isTableCreation) {
// 							console.log("选择变化，计算装饰器");
// 							return { decorations: computeDecorations(newState) };
// 						}

// 						return prev;
// 					},
// 				},
// 				props: {
// 					// 返回当前状态的装饰器
// 					decorations(state) {
// 						return key.getState(state)?.decorations || null;
// 					},
// 					// 处理 DOM 事件
// 					handleDOMEvents: {
// 						// 处理鼠标点击事件
// 						mousedown: (view, event) => {
// 							const target = event.target as HTMLElement;
// 							const action = target?.dataset?.action;

// 							// 如果不是插入点按钮，不处理
// 							if (!action) return false;

// 							event.preventDefault();

// 							// 解析动作类型和索引
// 							// 格式：insert-col-before:0 或 insert-row-before:0
// 							const [type, indexStr] = action.split(":");
// 							const index = Number(indexStr);
// 							const { state } = view;

// 							// 获取单元格位置
// 							const posAttr = (
// 								target.closest(
// 									'[data-insert-wrapper="1"]',
// 								) as HTMLElement | null
// 							)?.dataset.pos;
// 							const cellPos = posAttr ? Number(posAttr) : NaN;

// 							// 设置单元格选择，确保命令在正确的上下文中执行
// 							if (!Number.isNaN(cellPos)) {
// 								const $cell = state.doc.resolve(cellPos);
// 								const sel = new CellSelection($cell, $cell);
// 								view.dispatch(state.tr.setSelection(sel));
// 							}

// 							// 执行插入列命令
// 							if (type === "insert-col-before") {
// 								const editor = (view as any).editor;
// 								editor?.chain().focus().addColumnBefore().run();
// 								return true;
// 							}

// 							// 执行插入行命令
// 							if (type === "insert-row-before") {
// 								const editor = (view as any).editor;
// 								editor?.chain().focus().addRowBefore().run();
// 								return true;
// 							}

// 							return false;
// 						},

// 						// 处理鼠标悬停事件
// 						mouseover: (_view, event) => {
// 							const el = event.target as HTMLElement;
// 							const wrapper = el?.closest?.(
// 								'[data-insert-wrapper="1"]',
// 							) as HTMLElement | null;
// 							if (!wrapper) return false;

// 							// 添加悬停样式类
// 							wrapper.classList.add("tt-insert-hover");
// 							return false;
// 						},

// 						// 处理鼠标离开事件
// 						mouseout: (_view, event) => {
// 							const el = event.target as HTMLElement;
// 							const wrapper = el?.closest?.(
// 								'[data-insert-wrapper="1"]',
// 							) as HTMLElement | null;
// 							if (!wrapper) return false;

// 							// 移除悬停样式类
// 							wrapper.classList.remove("tt-insert-hover");
// 							return false;
// 						},
// 					},
// 				},
// 			}),
// 		];
// 	},
// });

// /**
//  * 计算装饰器
//  *
//  * 功能：根据当前选择状态，计算需要显示的插入点装饰器
//  *
//  * 流程：
//  * 1. 检查当前选择是否有效
//  * 2. 向上遍历文档树，找到表格节点
//  * 3. 如果找到表格，调用 buildDotsForTable 构建插入点
//  *
//  * @param state ProseMirror 状态
//  * @returns 装饰器集合
//  */
// function computeDecorations(state: any): DecorationSet | null {
// 	try {
// 		console.log("开始计算装饰器");

// 		// 检查状态是否有效
// 		if (!state || !state.selection || !state.doc) {
// 			console.log("状态无效，返回空装饰器");
// 			return DecorationSet.empty;
// 		}

// 		const { selection } = state;
// 		const $from = selection.$from;

// 		// 检查选择是否有效
// 		if (!$from || !$from.node) {
// 			console.log("选择无效，返回空装饰器");
// 			return DecorationSet.empty;
// 		}

// 		// 向上遍历文档树，找到表格节点
// 		for (let d = $from.depth; d > 0; d--) {
// 			const node = $from.node(d);

// 			// 检查是否是表格节点
// 			if (
// 				node &&
// 				node.type &&
// 				node.type.spec &&
// 				node.type.spec.tableRole === "table"
// 			) {
// 				console.log("找到表格节点，开始构建装饰器");
// 				const tablePos = $from.before(d);

// 				// 确保表格位置有效
// 				if (tablePos >= 0) {
// 					return buildDotsForTable(state, tablePos, node);
// 				}
// 			}
// 		}

// 		// 如果没有找到表格，返回空装饰器
// 		console.log("未找到表格，返回空装饰器");
// 		return DecorationSet.empty;
// 	} catch (error) {
// 		// 如果计算装饰器时出错，返回空集合
// 		console.warn("InsertHandles: Error computing decorations", error);
// 		return DecorationSet.empty;
// 	}
// }

// /**
//  * 为表格构建插入点装饰器
//  *
//  * 功能：在表格的第一行顶部和第一列左侧创建插入点
//  *
//  * 流程：
//  * 1. 验证表格节点和结构
//  * 2. 获取表格映射信息
//  * 3. 为第一行的每个单元格创建"插入列"按钮
//  * 4. 为第一列的每个单元格创建"插入行"按钮
//  *
//  * @param state ProseMirror 状态
//  * @param tablePos 表格在文档中的位置
//  * @param tableNode 表格节点
//  * @returns 装饰器集合
//  */
// function buildDotsForTable(state: any, tablePos: number, tableNode: any) {
// 	try {
// 		console.log("开始构建表格装饰器", { tablePos, tableNode });

// 		const decorations: Decoration[] = [];

// 		// 检查表格节点是否有效
// 		if (!tableNode || !tableNode.type || !tableNode.type.spec) {
// 			console.log("表格节点无效");
// 			return DecorationSet.empty;
// 		}

// 		// 检查文档状态是否有效
// 		if (!state || !state.doc || !state.doc.content) {
// 			console.log("文档状态无效");
// 			return DecorationSet.empty;
// 		}

// 		// 获取表格映射信息
// 		// TableMap 包含表格的结构信息，如宽度、高度、单元格位置等
// 		let map;
// 		try {
// 			map = TableMap.get(tableNode);
// 			console.log("获取表格映射成功", map);
// 		} catch (error) {
// 			console.warn("InsertHandles: Error getting table map", error);
// 			return DecorationSet.empty;
// 		}

// 		// 验证表格映射是否有效
// 		if (!map || !map.map || !Array.isArray(map.map)) {
// 			console.log("表格映射无效");
// 			return DecorationSet.empty;
// 		}

// 		// 检查表格尺寸是否有效
// 		if (!map.width || !map.height || map.width <= 0 || map.height <= 0) {
// 			console.log("表格尺寸无效", { width: map.width, height: map.height });
// 			return DecorationSet.empty;
// 		}

// 		console.log("表格映射有效，开始创建装饰器", {
// 			width: map.width,
// 			height: map.height,
// 		});

// 		// 第一行：每个单元格顶部中点，显示"插入列"按钮
// 		for (let col = 0; col < map.width; col++) {
// 			// 获取第一行第 col 列的单元格索引
// 			const cellIndex = map.map[col];
// 			if (cellIndex == null || cellIndex < 0) continue;

// 			// 计算单元格在文档中的位置
// 			const cellPos = tablePos + cellIndex + 1;

// 			// 检查位置是否有效
// 			if (cellPos < 0 || cellPos >= state.doc.content.size) {
// 				continue;
// 			}

// 			// 验证位置是否在文档范围内
// 			try {
// 				const $pos = state.doc.resolve(cellPos);
// 				if (!$pos || $pos.parent === null) {
// 					continue;
// 				}
// 			} catch (error) {
// 				console.warn("InsertHandles: Invalid cell position", error);
// 				continue;
// 			}

// 			// 创建装饰器组件
// 			const widget = Decoration.widget(
// 				cellPos,
// 				() => {
// 					// 创建包装容器
// 					const wrapper = document.createElement("div");
// 					wrapper.dataset.insertWrapper = "1";
// 					wrapper.dataset.pos = String(cellPos);

// 					// 设置容器样式：绝对定位在单元格顶部中点
// 					wrapper.style.position = "absolute";
// 					wrapper.style.top = "-8px";
// 					wrapper.style.left = "50%";
// 					wrapper.style.transform = "translate(-50%, -50%)";
// 					wrapper.style.pointerEvents = "auto";
// 					wrapper.style.display = "flex";
// 					wrapper.style.flexDirection = "column";
// 					wrapper.style.alignItems = "center";

// 					// 创建圆点按钮
// 					const dot = document.createElement("div");
// 					dot.setAttribute("data-action", `insert-col-before:${col}`);
// 					dot.style.width = "8px";
// 					dot.style.height = "8px";
// 					dot.style.borderRadius = "9999px";
// 					dot.style.background = "#9CA3AF"; // 浅灰色
// 					dot.style.boxShadow = "0 0 0 2px white";
// 					dot.style.cursor = "pointer";
// 					(dot as any).contentEditable = "false";

// 					// 创建气泡提示
// 					const bubble = document.createElement("div");
// 					bubble.textContent = "插入列";
// 					bubble.style.transform = "translateY(-8px)";
// 					bubble.style.whiteSpace = "nowrap";
// 					bubble.style.fontSize = "12px";
// 					bubble.style.padding = "4px 6px";
// 					bubble.style.borderRadius = "6px";
// 					bubble.style.background = "rgba(0,0,0,0.8)";
// 					bubble.style.color = "#fff";
// 					bubble.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
// 					bubble.style.marginBottom = "4px";
// 					bubble.style.display = "none"; // 默认隐藏

// 					// 创建"+"按钮
// 					const plus = document.createElement("button");
// 					plus.textContent = "+";
// 					plus.setAttribute("data-action", `insert-col-before:${col}`);
// 					plus.style.marginTop = "4px";
// 					plus.style.width = "20px";
// 					plus.style.height = "20px";
// 					plus.style.borderRadius = "9999px";
// 					plus.style.border = "1px solid #e5e7eb"; // gray-200
// 					plus.style.background = "#fff";
// 					plus.style.cursor = "pointer";
// 					plus.style.display = "none"; // 默认隐藏
// 					(plus as any).contentEditable = "false";

// 					// 组装元素
// 					wrapper.appendChild(bubble);
// 					wrapper.appendChild(dot);
// 					wrapper.appendChild(plus);

// 					// 悬停时显示气泡和按钮
// 					wrapper.addEventListener("mouseenter", () => {
// 						bubble.style.display = "block";
// 						plus.style.display = "block";
// 					});

// 					// 离开时隐藏
// 					wrapper.addEventListener("mouseleave", () => {
// 						bubble.style.display = "none";
// 						plus.style.display = "none";
// 					});

// 					return wrapper;
// 				},
// 				{
// 					side: -1, // 在单元格前面插入
// 					ignoreSelection: true, // 忽略选择状态
// 					stopEvent: () => true, // 阻止事件冒泡
// 				},
// 			);
// 			decorations.push(widget);
// 		}

// 		// 第一列：每个单元格左侧中点，显示"插入行"按钮
// 		for (let row = 0; row < map.height; row++) {
// 			// 获取第 row 行第一列的单元格索引
// 			const cellIndex = map.map[row * map.width];
// 			if (cellIndex == null || cellIndex < 0) continue;

// 			// 计算单元格在文档中的位置
// 			const cellPos = tablePos + cellIndex + 1;

// 			// 检查位置是否有效
// 			if (cellPos < 0 || cellPos >= state.doc.content.size) {
// 				continue;
// 			}

// 			// 验证位置是否在文档范围内
// 			try {
// 				const $pos = state.doc.resolve(cellPos);
// 				if (!$pos || $pos.parent === null) {
// 					continue;
// 				}
// 			} catch (error) {
// 				console.warn("InsertHandles: Invalid cell position", error);
// 				continue;
// 			}

// 			// 创建装饰器组件
// 			const widget = Decoration.widget(
// 				cellPos,
// 				() => {
// 					// 创建包装容器
// 					const wrapper = document.createElement("div");
// 					wrapper.dataset.insertWrapper = "1";
// 					wrapper.dataset.pos = String(cellPos);

// 					// 设置容器样式：绝对定位在单元格左侧中点
// 					wrapper.style.position = "absolute";
// 					wrapper.style.left = "-8px";
// 					wrapper.style.top = "50%";
// 					wrapper.style.transform = "translate(-50%, -50%)";
// 					wrapper.style.pointerEvents = "auto";
// 					wrapper.style.display = "flex";
// 					wrapper.style.alignItems = "center";

// 					// 创建气泡提示
// 					const bubble = document.createElement("div");
// 					bubble.textContent = "插入行";
// 					bubble.style.whiteSpace = "nowrap";
// 					bubble.style.fontSize = "12px";
// 					bubble.style.padding = "4px 6px";
// 					bubble.style.borderRadius = "6px";
// 					bubble.style.background = "rgba(0,0,0,0.8)";
// 					bubble.style.color = "#fff";
// 					bubble.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
// 					bubble.style.marginRight = "6px";
// 					bubble.style.display = "none"; // 默认隐藏

// 					// 创建圆点按钮
// 					const dot = document.createElement("div");
// 					dot.setAttribute("data-action", `insert-row-before:${row}`);
// 					dot.style.width = "8px";
// 					dot.style.height = "8px";
// 					dot.style.borderRadius = "9999px";
// 					dot.style.background = "#9CA3AF"; // 浅灰色
// 					dot.style.boxShadow = "0 0 0 2px white";
// 					dot.style.cursor = "pointer";
// 					(dot as any).contentEditable = "false";

// 					// 创建"+"按钮
// 					const plus = document.createElement("button");
// 					plus.textContent = "+";
// 					plus.setAttribute("data-action", `insert-row-before:${row}`);
// 					plus.style.marginLeft = "6px";
// 					plus.style.width = "20px";
// 					plus.style.height = "20px";
// 					plus.style.borderRadius = "9999px";
// 					plus.style.border = "1px solid #e5e7eb";
// 					plus.style.background = "#fff";
// 					plus.style.cursor = "pointer";
// 					plus.style.display = "none"; // 默认隐藏
// 					(plus as any).contentEditable = "false";

// 					// 组装元素
// 					wrapper.appendChild(bubble);
// 					wrapper.appendChild(dot);
// 					wrapper.appendChild(plus);

// 					// 悬停时显示气泡和按钮
// 					wrapper.addEventListener("mouseenter", () => {
// 						bubble.style.display = "block";
// 						plus.style.display = "block";
// 					});

// 					// 离开时隐藏
// 					wrapper.addEventListener("mouseleave", () => {
// 						bubble.style.display = "none";
// 						plus.style.display = "none";
// 					});

// 					return wrapper;
// 				},
// 				{
// 					side: -1, // 在单元格前面插入
// 					ignoreSelection: true, // 忽略选择状态
// 					stopEvent: () => true, // 阻止事件冒泡
// 				},
// 			);
// 			decorations.push(widget);
// 		}

// 		// 创建并返回装饰器集合
// 		return DecorationSet.create(state.doc, decorations);
// 	} catch (error) {
// 		// 如果构建装饰器时出错，记录警告并返回空集合
// 		console.warn("InsertHandles: Error building dots for table", error);
// 		return DecorationSet.empty;
// 	}
// }
