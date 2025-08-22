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

	const updateCurrentColors = useCallback(() => {
		if (!editor) return;

		const textColor = editor.getAttributes("textStyle").color || "#000000";
		setCurrentColor(textColor);

		const bgColor =
			editor.getAttributes("textStyle").backgroundColor || "transparent";
		setCurrentBgColor(bgColor);
	}, [editor]);

	const setTextColor = useCallback(
		(color: string) => {
			if (!editor) return;
			editor.chain().focus().setColor(color).run();
			setCurrentColor(color);
		},
		[editor],
	);

	const setTextBgColor = useCallback(
		(bgColor: string) => {
			if (!editor) return;
			editor.chain().focus().setBackgroundColor(bgColor).run();
			setCurrentBgColor(bgColor);
		},
		[editor],
	);

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
				<Button variant="ghost" size="icon" className="border-none border-0">
					<div
						className="flex items-center justify-center size-6 rounded transition-all"
						style={{ backgroundColor: currentBgColor }}
					>
						<FontIcon
							className="size-4 transition-colors"
							style={{ color: currentColor }}
						/>
					</div>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="p-4 shadow-xl rounded-lg">
				<div className="mb-4">
					<div className="flex items-center justify-between mb-3">
						<div className="text-sm font-medium text-gray-800">文本颜色</div>
						<div className="flex items-center justify-center gap-1">
							<div
								className="size-4 rounded-full border border-gray-300 shadow-sm"
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
									"size-6 rounded-full cursor-pointer",
									"hover:scale-110 transition-all duration-150",
									currentColor === color && "scale-110 shadow-md",
								)}
								style={{ backgroundColor: color }}
								onClick={() => setTextColor(color)}
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
									"size-6 rounded-full transition-all duration-150 cursor-pointer",
									"hover:scale-110",
									currentBgColor === bgColor && "scale-110 shadow-md",
									bgColor === "transparent" &&
										"border-gray-400 bg-white border",
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
							/>
						))}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TextColor;
