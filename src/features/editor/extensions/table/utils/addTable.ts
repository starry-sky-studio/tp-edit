import type { Editor } from "@tiptap/react";

/**
 * 提取公共逻辑：查找光标所在的表格及其位置信息
 *
 * @param editor - Tiptap 编辑器实例
 * @returns {tableNode, tableStartPos} - 表格节点对象和表格在文档中的起始位置
 *
 * 功能说明：
 * - 从当前光标位置向上遍历节点树，查找最近的 'table' 节点
 * - 返回表格节点和其在文档中的绝对位置
 * - 这个位置用于后续计算表格内部单元格/行的相对位置
 */
const findTablePosition = (editor: Editor) => {
	const { state } = editor;
	const { selection } = state;
	const { $from } = selection; // $from 是 ProseMirror 中表示选择起始位置的 ResolvedPos 对象

	let tableStartPos = 0;
	let tableNode = null;

	// 向上遍历查找最近的 'table' 节点
	// $from.depth 表示光标在节点树中的深度（0 是文档根节点）
	for (let depth = $from.depth; depth > 0; depth--) {
		const node = $from.node(depth); // 获取当前深度的节点
		if (node.type.name === "table") {
			tableNode = node;
			// tableStartPos 是 <table> 节点在文档中的绝对起始位置
			// $from.before(depth) 返回当前节点在父节点中的起始位置（在节点开始标签之前）
			// 这个位置是计算表格内部元素位置的基准点
			tableStartPos = $from.before(depth);
			break;
		}
	}

	return { tableNode, tableStartPos };
};

/**
 * 添加 一列 table column 根据 index 如果有index 则在index 后面添加一列
 * 没有index 根据鼠标位置 在后面添加一列
 *
 * @param editor - Tiptap 编辑器实例
 * @param columnIndex - 可选的列索引。如果提供，在 columnIndex 之前插入（除非 columnIndex 等于列数，则在末尾插入）。
 */
export const addTableColumn = (editor: Editor, columnIndex?: number) => {
	if (columnIndex === undefined) {
		editor.chain().focus().addColumnAfter().run();
		return;
	}

	try {
		const { tableNode, tableStartPos } = findTablePosition(editor);

		if (!tableNode) {
			editor.chain().focus().addColumnAfter().run();
			return;
		}

		// 2. 检查第一行和索引有效性
		const firstRow = tableNode.firstChild;
		if (!firstRow) {
			return;
		}

		const columnCount = firstRow.childCount;

		if (columnIndex < 0 || columnIndex > columnCount) {
			editor.chain().focus().addColumnAfter().run();
			return;
		}

		// 目标：在最后一列 (index: columnCount - 1) 之后插入。
		if (columnIndex === columnCount) {
			// 1. 计算最后一列在第一行中的单元格的起始位置 (<td> 节点位置)。
			// tableStartPos + 1 是 <tr> 的起始位置。
			// tableStartPos + 2 是第一个 <td> 的起始位置。
			let cellStartPos = tableStartPos + 2;

			// 遍历到倒数第二列结束，定位到最后一列的起始
			for (let i = 0; i < columnCount - 1; i++) {
				const cell = firstRow.child(i);
				cellStartPos += cell.nodeSize;
			}

			// posInLastCell 是最后一列的内容起始安全位置: <td> (cellStartPos) + 1 (内容)
			const posInLastCell = cellStartPos + 1;
			const lastCellNode = firstRow.child(columnCount - 1);

			// 新列的第一个单元格的内容起始位置 (修正 +2 -> +1):
			// NewCellStart (插入的 <td> 节点起始) = cellStartPos + lastCellNode.nodeSize
			// NewCellContentStart = NewCellStart + 1
			const posInNewCell = cellStartPos + lastCellNode.nodeSize + 1; // 修正光标位置

			// 选区定位到倒数第二列的内部，然后执行 addColumnAfter
			editor
				.chain()
				.focus()
				.setTextSelection(posInLastCell)
				.addColumnAfter()
				.run();

			// 光标定位到新插入的列的内容起始位置
			setTimeout(() => {
				if (editor.isDestroyed) return;
				// 使用 commands 直接设置选区和聚焦，跳过 chain，提高命令执行的即时性
				editor.commands.setTextSelection(posInNewCell);
				editor.commands.focus();
			}, 0);
			return;
		}

		// 3. 计算目标单元格的内部位置 (用于 addColumnBefore)
		// tableStartPos + 2: 第一个 <td> 的起始位置
		let cellStartPos = tableStartPos + 2;

		// 遍历到目标列 **之前** 的所有单元格，累加它们的 nodeSize
		for (let i = 0; i < columnIndex; i++) {
			const cell = firstRow.child(i);
			cellStartPos += cell.nodeSize;
		}

		// posInCell (目标列的内容起始安全位置: <td> + 1)
		const posInCell = cellStartPos + 1;

		// 4. 执行文档修改命令
		// 选区定位到目标列内部，然后执行 addColumnBefore
		editor.chain().focus().setTextSelection(posInCell).addColumnBefore().run();

		// 新列的内容起始位置就是目标列原来的位置 (因为新列插入在前面)
		setTimeout(() => {
			if (editor.isDestroyed) return;
			editor.commands.setTextSelection(posInCell);
			editor.commands.focus();
		}, 0);
	} catch (error) {
		console.error(
			"Error adding column by index. Falling back to default:",
			error,
		);
		editor.chain().focus().addColumnAfter().run();
	}
};

/**
 * 添加 一行 table row 根据 index 如果有index 则在index 后面添加一行
 * 没有index 根据鼠标位置 在后面添加一行
 *
 * @param editor - Tiptap 编辑器实例
 * @param rowIndex - 可选的行索引。如果提供，在 rowIndex 之前插入（除非 rowIndex 等于行数，则在末尾插入）。
 */
export const addTableRow = (editor: Editor, rowIndex?: number) => {
	try {
		const { tableNode, tableStartPos } = findTablePosition(editor);

		// 1. 检查表格和 rowIndex
		if (!tableNode) {
			editor.chain().focus().addRowAfter().run();
			return;
		}

		const rowCount = tableNode.childCount;

		if (rowIndex === undefined) {
			editor.chain().focus().addRowAfter().run();
			return;
		}

		if (rowIndex < 0 || rowIndex > rowCount) {
			editor.chain().focus().addRowAfter().run();
			return;
		}

		// 2. 计算目标行的起始位置 (<tr> 节点的位置)
		let targetRowStartPos = tableStartPos + 1; // Start of the first <tr>

		// targetRowNode is the <tr> node we are positioning the cursor in/before
		let targetRowNode: any;
		let isAppend = false;

		if (rowIndex === rowCount) {
			// 目标: 在最后一行之后插入。将定位到最后一行的第一个单元格内容
			targetRowNode = tableNode.child(rowCount - 1);
			isAppend = true;
		} else {
			// 目标: 在 rowIndex 之前插入。将定位到 rowIndex 行的第一个单元格内容
			targetRowNode = tableNode.child(rowIndex);
		}

		// 累加到目标行 (或倒数第二行，如果是 append 模式) 的起始位置
		const iterationCount = isAppend ? rowCount - 1 : rowIndex;
		for (let i = 0; i < iterationCount; i++) {
			const row = tableNode.child(i);
			targetRowStartPos += row.nodeSize;
		}

		// 3. 定位到目标行的第一个单元格的内容起始位置 (Pos + 2: <tr> + <td> + Content)
		// targetRowStartPos 是 <tr> 节点的位置。
		// targetRowStartPos + 1 是 <td> 节点的位置。
		// targetRowStartPos + 2 是 <td> 内容的起始位置。
		const posInFirstCell = targetRowStartPos + 2;

		let posInNewRowFirstCell: number;

		// 4. 执行文档修改命令
		if (isAppend) {
			// 在最后一行之后插入 (使用 addRowAfter)
			editor
				.chain()
				.focus()
				.setTextSelection(posInFirstCell)
				.addRowAfter()
				.run();

			// 新行插入在目标行之后，其第一个单元格的内容起始位置:
			// NewRowStart = targetRowStartPos + targetRowNode.nodeSize
			// posInNewRowFirstCell = NewRowStart + 2
			posInNewRowFirstCell = targetRowStartPos + targetRowNode.nodeSize + 2;
		} else {
			// 在 rowIndex 之前插入 (使用 addRowBefore)
			editor
				.chain()
				.focus()
				.setTextSelection(posInFirstCell)
				.addRowBefore()
				.run();

			// 新行插入在目标行之前，其第一个单元格的内容起始位置就是目标行原来的位置: targetRowStartPos + 2
			posInNewRowFirstCell = targetRowStartPos + 2;
		}

		// 5. 光标定位到新插入的行
		setTimeout(() => {
			if (editor.isDestroyed) return;
			editor.commands.setTextSelection(posInNewRowFirstCell);
			editor.commands.focus();
		}, 0);
	} catch (error) {
		console.error("Error adding row by index. Falling back to default:", error);
		editor.chain().focus().addRowAfter().run();
	}
};
