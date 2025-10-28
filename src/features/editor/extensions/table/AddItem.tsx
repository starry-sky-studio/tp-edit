import type { Editor } from "@tiptap/react";

interface CreateTooltipElementProps {
	text?: string;
	className?: string;
	style?: React.CSSProperties;
	onClick?: () => void;
	index?: number;
	editor?: Editor;
}

// DOM 元素版本，用于 ProseMirror decorations

export const createTooltipElement = ({
	text = "添加列",
	className = "grip-pseudo rounded-full size-4 absolute bg-green-100",
	style = {},
	onClick,
	index,
	editor,
}: CreateTooltipElementProps) => {
	// 创建可交互的元素 圆点

	const tooltipElement = document.createElement("div");
	// 防抖/清理相关引用，避免内存泄露
	let mounted = true;
	let rafId: number | null = null;
	tooltipElement.className = className;

	// 将 React.CSSProperties 的 camelCase 转为 CSS kebab-case
	const overrideCss = Object.entries(style)
		.map(
			([key, value]) =>
				`${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${value}`,
		)
		.join("; ");

	tooltipElement.style.cssText = `
			position: absolute;
			top: -50%;
			left: 0%;
			transform: translate(-50%, -50%);
			width: 6px;
			height: 6px;
			background-color: pink;
			border-radius: 50%;
			transition: all 0.2s ease;
			cursor: pointer;
			${overrideCss}
`;

	// 创建 Tooltip 提示框

	const tooltip = document.createElement("div");
	tooltip.className = "custom-tooltip";
	tooltip.textContent = text;
	tooltip.style.cssText = `
		position: absolute;
		top: -50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		white-space: nowrap;
		z-index: 1000;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
`;

	// 添加鼠标事件

	const onMouseOver = (e: MouseEvent) => {
		e.stopPropagation();
		tooltipElement.style.transform = "translate(-50%, -50%) scale(5)";
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			if (!mounted) return;
			const rect = tooltipElement.getBoundingClientRect();
			tooltip.style.position = "fixed";
			tooltip.style.top = `${Math.round(rect.top - 10)}px`;
			tooltip.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
			tooltip.style.transform = "translate(-50%, -100%)";
			tooltip.style.opacity = "1";
		});
	};
	tooltipElement.addEventListener("mouseover", onMouseOver as any);

	const onMouseOut = (e: MouseEvent) => {
		e.stopPropagation();
		tooltipElement.style.transform = "translate(-50%, -50%) scale(1)";
		tooltip.style.opacity = "0";
	};
	tooltipElement.addEventListener("mouseout", onMouseOut as any);

	const onMouseDown = (e: MouseEvent) => {
		e.stopPropagation();
		onClick?.();
		if (index !== undefined && editor) {
			addTableColumn(editor, index);
		}
	};
	tooltipElement.addEventListener("mousedown", onMouseDown as any);

	// 添加点击事件

	// 将 tooltip 添加到 body，确保它能正确显示

	document.body.appendChild(tooltip);

	// 返回容器元素和清理函数

	return {
		element: tooltipElement,
		cleanup: () => {
			mounted = false;
			if (rafId) cancelAnimationFrame(rafId);
			tooltipElement.removeEventListener("mouseover", onMouseOver as any);
			tooltipElement.removeEventListener("mouseout", onMouseOut as any);
			tooltipElement.removeEventListener("mousedown", onMouseDown as any);
			if (tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		},
	};
};

//添加 一行 table row 根据 index 如果有index 则在index 后面添加一行

// 没有index 根据鼠标位置 在后面添加一行

export const addTableRow = (editor: Editor, index?: number) => {
	if (index !== undefined) {
		// 根据 index 定位到指定行，然后在该行后添加新行
		// 需要先选中指定行的单元格，然后添加行
		const { state } = editor;
		const { selection } = state;
		// 找到表格
		const table = selection.$anchor.node(-1);

		if (table && table.type.name === "table") {
			// 选中指定行的第一个单元格
			const tableMap = table.attrs.map;
			const rowStart = tableMap[index * tableMap.width];
			const cellPos = selection.$anchor.start(-1) + rowStart;
			// 选中该行

			editor.chain().focus().setTextSelection(cellPos).addRowAfter().run();
		}

		return;
	}

	editor.chain().focus().addRowBefore().run();
};

//添加 一列 table column 根据 index 如果有index 则在index 后面添加一列

//没有index 根据鼠标位置 在后面添加一列

const addTableColumn = (editor: Editor, columnIndex?: number) => {
	if (columnIndex === undefined) {
		editor.chain().focus().addColumnAfter().run();
		return;
	}

	const { state } = editor;
	const { selection } = state;
	try {
		// 1. 查找表格及其位置
		const { $from } = selection;
		let tableStartPos = 0;
		let tableNode = null;
		// 向上遍历查找最近的 'table' 节点

		for (let depth = $from.depth; depth > 0; depth--) {
			const node = $from.node(depth);
			if (node.type.name === "table") {
				tableNode = node;
				tableStartPos = $from.before(depth); // <table> 节点外部位置
				break;
			}
		}

		if (!tableNode) {
			editor.chain().focus().addColumnAfter().run();
			return;
		}

		// 2. 检查第一行和索引有效性

		const firstRow = tableNode.firstChild;
		if (!firstRow) {
			return;
		}

		// 注意: 这里检查的是 columnIndex 是否在 [0, childCount-1] 范围内，

		// 以确保我们能找到一个目标单元格进行定位。

		const columnCount = firstRow.childCount;

		if (columnIndex < 0 || columnIndex > columnCount) {
			editor.chain().focus().addColumnAfter().run();
			return;
		}

		// **修复：处理在末尾插入的情况 (columnIndex 等于列数)**

		// 如果光标不在最后一列，简单的 addColumnAfter() 会在光标所在列后插入，不符合预期。

		if (columnIndex === columnCount) {
			// 目标：在最后一列 (index: columnCount - 1) 之后插入。
			// 1. 查找最后一列在第一行中的单元格的起始位置。
			let cellStartPos = tableStartPos + 2; // <tr> 内部开始 (即第一个 <td> 之前)

			// 遍历到倒数第二列结束，定位到最后一列的起始
			for (let i = 0; i < columnCount - 1; i++) {
				const cell = firstRow.child(i);
				cellStartPos += cell.nodeSize;
			}

			// posInLastCell (最后一列的内容起始安全位置: <td> + 1)
			const posInLastCell = cellStartPos + 1;

			// 计算新列的起始内容位置
			const lastCellNode = firstRow.child(columnCount - 1);
			// 新列的内容起始位置 = (最后一列的起始位置) + (最后一列的 nodeSize) + 1 (进入新单元格内容)
			const posInNewCell = cellStartPos + lastCellNode.nodeSize + 1;

			editor
				.chain()
				.focus()
				.setTextSelection(posInLastCell)
				.addColumnAfter()
				.run();

			//光标定位到新插入的列的内容起始位置

			setTimeout(() => {
				if (editor.isDestroyed) return;
				// 尝试向右偏移 1 个位置，进入默认的 <p> 标签内容内部
				const finalSelectionPos = posInNewCell + 1;
				// 使用 commands 直接设置选区和聚焦，跳过 chain，提高命令执行的即时性
				editor.commands.setTextSelection(finalSelectionPos);
				editor.commands.focus();
			}, 0);
			return;
		}

		// 3. 计算目标单元格的内部位置

		// tableStartPos + 2: <tr> 内部开始 (即第一个 <td> 之前)

		let cellStartPos = tableStartPos + 2;

		// 遍历到目标列 **之前** 的所有单元格，累加它们的 nodeSize

		for (let i = 0; i < columnIndex; i++) {
			const cell = firstRow.child(i);
			cellStartPos += cell.nodeSize;
		}

		// posInCell (目标列的内容起始安全位置)

		// <td> (cellStartPos) -> [CONTENT START] (cellStartPos + 1)

		const posInCell = cellStartPos + 1;

		// 4. 执行文档修改命令

		editor.chain().focus().setTextSelection(posInCell).addColumnBefore().run();

		setTimeout(() => {
			if (editor.isDestroyed) return;
			const finalSelectionPos = posInCell + 1;
			editor.commands.setTextSelection(finalSelectionPos);
			editor.commands.focus();
		}, 0);
	} catch (error) {
		// 在 ProseMirror 中，手动计算位置容易出错，捕获错误并回退到默认行为是必要的。
		console.error(
			"Error adding column by index. Falling back to default:",
			error,
		);

		editor.chain().focus().addColumnAfter().run();
	}
};
