import type { Editor } from "@tiptap/react";
import { useState } from "react";

interface TableGridSelectorProps {
	editor: Editor | null;
	onClose: () => void;
}

const TableGridSelector = ({ editor, onClose }: TableGridSelectorProps) => {
	const [hoveredRows, setHoveredRows] = useState(0);
	const [hoveredCols, setHoveredCols] = useState(0);

	const maxRows = 8;
	const maxCols = 8;

	const insertTable = (rows: number, cols: number) => {
		if (!editor) return;

		editor
			.chain()
			.focus()
			.insertTable({ rows, cols, withHeaderRow: true })
			.run();

		onClose();
	};

	const handleCellHover = (row: number, col: number) => {
		setHoveredRows(row + 1);
		setHoveredCols(col + 1);
	};

	const handleCellClick = (row: number, col: number) => {
		insertTable(row + 1, col + 1);
	};

	return (
		<div className="p-2 bg-white">
			<div className="flex items-center justify-between px-2 mb-2">
				<h3 className="text-xs font-medium text-gray-700 ">
					插入支持富文本的表格
				</h3>
				{hoveredRows > 0 && hoveredCols > 0 && (
					<span className="text-xs text-gray-500">
						{hoveredRows}×{hoveredCols}
					</span>
				)}
			</div>

			<div className="grid grid-cols-8 gap-1 border p-2">
				{Array.from({ length: maxRows }, (_, row) =>
					Array.from({ length: maxCols }, (_, col) => (
						<div
							key={`${row}-${col}`}
							className={`
								w-4 h-4 border border-gray-300 cursor-pointer transition-colors
								${
									row < hoveredRows && col < hoveredCols
										? "bg-blue-500 border-blue-500"
										: "bg-gray-100 hover:bg-gray-200"
								}
							`}
							onMouseEnter={() => handleCellHover(row, col)}
							onClick={() => handleCellClick(row, col)}
						/>
					)),
				)}
			</div>

			<div className="flex mt-2 justify-between items-center px-2 text-xs text-gray-500">
				<span>点击选择表格大小</span>
				<span>
					最大 {maxRows}×{maxCols}
				</span>
			</div>
		</div>
	);
};

export default TableGridSelector;
