import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Editor } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MergeCellsIcon, SplitCellsIcon } from "@/styles/svg";
import Heading from "../Common/Heading";
import TextAlign from "../Common/TextAlign";
import ColorComp from "../Common/TextColor";
import TextStyles from "../Common/TextStyles";

const TableMenus = ({ editor }: { editor: Editor | null }) => {
	// 基于编辑器当前状态动态判断可操作性
	const [canMerge, setCanMerge] = useState<boolean>(false);
	const [canSplit, setCanSplit] = useState<boolean>(false);
	// 在table 中是否能删除 一行或者一列 或者整个表格
	const [canDeleteColumn, setCanDeleteColumn] = useState<boolean>(false);
	const [canDeleteRow, setCanDeleteRow] = useState<boolean>(false);
	const [canDeleteTable, setCanDeleteTable] = useState<boolean>(false);
	const [selectionType, setSelectionType] = useState<
		"row" | "column" | "table" | "none"
	>("none");

	// 使用 Tiptap 内置的 CellSelection 和 TableMap 来判断表格选择类型
	const getTableSelection = useCallback(
		(editor: Editor): "row" | "column" | "table" | "none" => {
			try {
				if (!editor.isActive("table")) {
					return "none";
				}

				const { selection } = editor.state;

				// 检查是否是 CellSelection（表格多选）
				if (!(selection instanceof CellSelection)) {
					// 单个单元格内的文本选择，默认视为行操作
					return "row";
				}

				// 获取表格的 TableMap 和选择的矩形区域
				const map = TableMap.get(selection.$anchorCell.node(-1));
				const start = selection.$anchorCell.start(-1);
				const rect = map.rectBetween(
					selection.$anchorCell.pos - start,
					selection.$headCell.pos - start,
				);

				console.log("Table selection rect:", {
					rect,
					mapWidth: map.width,
					mapHeight: map.height,
					isWholeTable:
						rect.left === 0 &&
						rect.right === map.width &&
						rect.top === 0 &&
						rect.bottom === map.height,
					isFullRows: rect.left === 0 && rect.right === map.width,
					isFullColumns: rect.top === 0 && rect.bottom === map.height,
				});

				// 判断是否选择了整个表格
				if (
					rect.left === 0 &&
					rect.right === map.width &&
					rect.top === 0 &&
					rect.bottom === map.height
				) {
					return "table";
				}

				// 判断是否选择了完整的行（从左到右）
				if (rect.left === 0 && rect.right === map.width) {
					return "row";
				}

				// 判断是否选择了完整的列（从上到下）
				if (rect.top === 0 && rect.bottom === map.height) {
					return "column";
				}

				// 其他情况（部分单元格），默认为行操作
				return "row";
			} catch (error) {
				console.warn("Error in getTableSelection:", error);
				return "none";
			}
		},
		[],
	);

	const recomputeAvailability = useCallback(() => {
		if (!editor) return;
		// 需要 focus 才能正确评估 can()，否则初次选择会一直是不可操作
		const mergeAvailable = editor.can().chain().focus().mergeCells().run();
		const splitAvailable = editor.can().chain().focus().splitCell().run();

		// 分别检查各种删除操作的可能性 - 注意：can() 检查不应该调用 run()
		const deleteColumnAvailable = editor.can().deleteColumn();
		const deleteRowAvailable = editor.can().deleteRow();
		const deleteTableAvailable = editor.can().deleteTable();

		// 使用新的 getTableSelection 函数
		const currentSelectionType = getTableSelection(editor);

		setCanMerge(mergeAvailable);
		setCanSplit(splitAvailable);
		setCanDeleteColumn(deleteColumnAvailable);
		setCanDeleteRow(deleteRowAvailable);
		setCanDeleteTable(deleteTableAvailable);
		setSelectionType(currentSelectionType);
	}, [editor, getTableSelection]);

	useEffect(() => {
		if (!editor) return;
		recomputeAvailability();
		const events = ["selectionUpdate", "transaction", "update"] as const;
		events.forEach((evt) => {
			editor.on(evt, recomputeAvailability);
		});
		return () => {
			events.forEach((evt) => {
				editor.off(evt, recomputeAvailability);
			});
		};
	}, [editor, recomputeAvailability]);

	// 放在 hooks 之后再做渲染短路，避免“条件调用 hooks” 的 linter 报错
	if (!editor || !editor.isEditable) return null;

	const handleMergeOrSplit = () => {
		if (canMerge) {
			editor.chain().focus().mergeCells().run();
			return;
		}
		if (canSplit) {
			editor.chain().focus().splitCell().run();
		}
	};

	const handleDelete = () => {
		// 根据选择类型执行相应的删除操作
		if (selectionType === "table" && canDeleteTable) {
			editor.chain().focus().deleteTable().run();
		} else if (selectionType === "column" && canDeleteColumn) {
			editor.chain().focus().deleteColumn().run();
		} else if (selectionType === "row" && canDeleteRow) {
			editor.chain().focus().deleteRow().run();
		}
	};

	// 计算是否有任何删除操作可用
	const canDelete = canDeleteColumn || canDeleteRow || canDeleteTable;

	// 获取删除操作的提示文本 - 根据选择类型显示
	const getDeleteTooltip = () => {
		if (selectionType === "table" && canDeleteTable) {
			return "删除表格";
		} else if (selectionType === "column" && canDeleteColumn) {
			return "删除列";
		} else if (selectionType === "row" && canDeleteRow) {
			return "删除行";
		}
		return "不可删除";
	};

	return (
		<div className="flex relative h-10 items-center w-full justify-start gap-0.5  px-2">
			<Tooltip>
				<TooltipTrigger>
					<div
						className={`rounded-md size-9 flex justify-center items-center ${canMerge || canSplit ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed opacity-50"}`}
						onClick={canMerge || canSplit ? handleMergeOrSplit : undefined}
					>
						{canMerge ? <MergeCellsIcon /> : <SplitCellsIcon />}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						{canMerge ? "合并单元格" : canSplit ? "拆分单元格" : "不可操作"}
					</p>
				</TooltipContent>
			</Tooltip>
			<Heading editor={editor} />
			<TextAlign editor={editor} />
			<TextStyles editor={editor} />
			<ColorComp editor={editor} />
			<Tooltip>
				<TooltipTrigger>
					<div
						className={`rounded-md size-9 flex justify-center items-center ${canDelete ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed opacity-50"}`}
						onClick={canDelete ? handleDelete : undefined}
					>
						<Trash2 className="size-4" />
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>{getDeleteTooltip()}</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default TableMenus;
