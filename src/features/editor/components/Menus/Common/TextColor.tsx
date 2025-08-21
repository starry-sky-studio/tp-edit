import type { Editor } from "@tiptap/react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontIcon } from "@/styles/svg";

export const textColorList: string[] = [
	"#000000",
	"#9E9E9E",
	"#E53935",
	"#FB8C00",
	"#FDD835",
	"#43A047",
	"#1E88E5",
	"#8E24AA",
];

export const textBgColorList: string[] = [
	"transparent",
	"#ECEFF1",
	"#F8BBD0",
	"#FFE0B2",
	"#FFF59D",
	"#C8E6C9",
	"#BBDEFB",
	"#E1BEE7",
	"#B0BEC5",
	"#EF5350",
	"#FFA726",
	"#FFEB3B",
	"#66BB6A",
	"#64B5F6",
	"#BA68C8",
];

const TextColor = ({ editor }: { editor: Editor | null }) => {
	const [currentColor, setCurrentColor] = useState("#000000");
	const [currentBgColor, setCurrentBgColor] = useState("transparent");

	// 更新当前文本颜色和背景颜色
	const updateCurrentColors = useCallback(() => {
		if (!editor) return;

		// 获取当前文本颜色
		const textColor = editor.getAttributes("textStyle").color || "#000000";
		setCurrentColor(textColor);

		// 获取当前背景颜色
		const bgColor =
			editor.getAttributes("textStyle").backgroundColor || "transparent";
		setCurrentBgColor(bgColor);
	}, [editor]);

	// 设置文本颜色
	const setTextColor = useCallback(
		(color: string) => {
			if (!editor) return;

			editor.chain().focus().setColor(color).run();
			setCurrentColor(color);
		},
		[editor],
	);

	// 设置文本背景颜色
	const setTextBgColor = useCallback(
		(bgColor: string) => {
			if (!editor) return;

			editor.chain().focus().setBackgroundColor(bgColor).run();
			setCurrentBgColor(bgColor);
		},
		[editor],
	);

	// 监听编辑器变化
	useEffect(() => {
		if (!editor || !editor.isEditable) return;

		updateCurrentColors();

		const handleUpdate = () => {
			updateCurrentColors();
		};

		editor.on("selectionUpdate", handleUpdate);
		editor.on("transaction", handleUpdate);

		return () => {
			editor.off("selectionUpdate", handleUpdate);
			editor.off("transaction", handleUpdate);
		};
	}, [editor, updateCurrentColors]);

	if (!editor || !editor.isEditable) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={clsx(
						"border-none border-0 relative",
						"transition-all duration-200",
						"hover:bg-gray-100 active:bg-gray-200",
						"h-9 w-9", // 确保按钮尺寸一致
					)}
				>
					<div
						className={clsx(
							"relative flex items-center justify-center w-6 h-6 rounded transition-all",
							currentBgColor !== "transparent" && "p-1",
						)}
						style={{ backgroundColor: currentBgColor }}
					>
						<FontIcon
							name="text-color"
							className={clsx(
								"size-4 transition-colors",
								currentBgColor !== "transparent"
									? "text-white"
									: "text-gray-700",
							)}
							style={{ color: currentColor }}
						/>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-64 p-4 shadow-xl rounded-lg"
				align="start"
				sideOffset={5}
			>
				<div className="mb-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-800">文本颜色</div>
						<div className="flex items-center justify-center gap-1">
							<div
								className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
								style={{ backgroundColor: currentColor }}
							/>
							<div className="text-sm text-gray-500">{currentColor}</div>
						</div>
					</div>
					<div className="grid grid-cols-8 gap-1.5">
						{textColorList.map((color) => (
							<button
								key={color}
								className={clsx(
									"size-6 rounded-full",
									"hover:scale-110 transition-all duration-150",
									currentColor === color && "scale-110 shadow-md",
								)}
								style={{ backgroundColor: color }}
								onClick={() => setTextColor(color)}
								title={color}
								aria-label={`设置文本颜色为 ${color}`}
							/>
						))}
					</div>
				</div>

				<div className="mb-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-800">背景颜色</div>
						<div className="flex items-center justify-center gap-1">
							<div
								className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
								style={{ backgroundColor: currentBgColor }}
							/>
							<div className="text-sm text-gray-500">{currentBgColor}</div>
						</div>
					</div>
					<div className="grid grid-cols-8 gap-1.5">
						{textBgColorList.map((bgColor) => (
							<button
								key={bgColor}
								className={clsx(
									"size-6 rounded-full border-2 transition-all duration-150",
									"hover:scale-110",
									currentBgColor === bgColor && "scale-110  shadow-md",
									bgColor === "transparent"
										? "border-gray-400 bg-white"
										: "border-transparent",
								)}
								style={{
									backgroundColor:
										bgColor !== "transparent" ? bgColor : "#f8fafc",
									backgroundImage:
										bgColor === "transparent"
											? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0)"
											: undefined,
									backgroundSize:
										bgColor === "transparent" ? "8px 8px" : undefined,
									backgroundPosition:
										bgColor === "transparent" ? "0 0, 4px 4px" : undefined,
								}}
								onClick={() => setTextBgColor(bgColor)}
								title={bgColor === "transparent" ? "无背景" : bgColor}
								aria-label={`设置背景颜色为 ${bgColor === "transparent" ? "无" : bgColor}`}
							/>
						))}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TextColor;
