import { Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import {
	backgroundColors,
	borderColors,
	defaultColors,
	resetColors,
	textColors,
} from "./config";

interface ColorPickerProps {
	onTextColorChange?: (color: string) => void;
	onBorderColorChange?: (color: string) => void;
	onBackgroundColorChange?: (color: string) => void;
	onReset?: () => void;
	defaultTextColor?: string;
	defaultBorderColor?: string;
	defaultBackgroundColor?: string;
	showTextColor?: boolean;
	showBorderColor?: boolean;
	showBackgroundColor?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
	onTextColorChange,
	onBorderColorChange,
	onBackgroundColorChange,
	onReset,
	defaultTextColor = defaultColors.text,
	defaultBorderColor = defaultColors.border,
	defaultBackgroundColor = defaultColors.background,
	showTextColor = true,
	showBorderColor = true,
	showBackgroundColor = true,
}) => {
	const [selectedTextColor, setSelectedTextColor] = useState(defaultTextColor);
	const [selectedBorderColor, setSelectedBorderColor] =
		useState(defaultBorderColor);
	const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(
		defaultBackgroundColor,
	);

	const handleTextColorSelect = (color: string) => {
		setSelectedTextColor(color);
		onTextColorChange?.(color);
	};

	const handleBorderColorSelect = (color: string) => {
		setSelectedBorderColor(color);
		onBorderColorChange?.(color);
	};

	const handleBackgroundColorSelect = (color: string) => {
		setSelectedBackgroundColor(color);
		onBackgroundColorChange?.(color);
	};

	const handleRandomTextColor = () => {
		const randomColor =
			textColors[Math.floor(Math.random() * textColors.length)];
		handleTextColorSelect(randomColor.value);
	};

	const handleReset = () => {
		setSelectedTextColor(resetColors.text);
		setSelectedBorderColor(resetColors.border);
		setSelectedBackgroundColor(resetColors.background);
		onReset?.();
	};

	return (
		<HoverCard openDelay={0}>
			<HoverCardTrigger asChild>
				<Button variant="ghost" size="sm" className="p-2">
					<Palette className="h-4 w-4" />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent className="w-80 p-4" align="start">
				<div className="space-y-4">
					{/* 文字颜色部分 */}
					{showTextColor && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-gray-700">
									文字颜色
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleRandomTextColor}
									className="text-xs text-gray-500 hover:text-gray-700"
								>
									<svg
										className="w-3 h-3 mr-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									随机
								</Button>
							</div>
							<div className="flex gap-1">
								{textColors.map((color) => (
									<button
										key={color.value}
										onClick={() => handleTextColorSelect(color.value)}
										className={cn(
											"w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-105",
											selectedTextColor === color.value
												? "border-blue-500 ring-2 ring-blue-200"
												: "border-gray-200 hover:border-gray-300",
										)}
										style={{
											backgroundColor:
												color.value === "transparent" ? "#f3f4f6" : "white",
										}}
									>
										<span
											style={{
												color:
													color.value === "transparent"
														? "#9ca3af"
														: color.value,
											}}
										>
											A
										</span>
									</button>
								))}
							</div>
						</div>
					)}

					{/* 边框颜色部分 */}
					{showBorderColor && (
						<div className="space-y-2">
							<span className="text-sm font-medium text-gray-700">
								边框颜色
							</span>
							<div className="flex gap-1">
								{borderColors.map((color) => (
									<button
										key={color.value}
										onClick={() => handleBorderColorSelect(color.value)}
										className={cn(
											"w-8 h-8 rounded border-2 transition-all hover:scale-105",
											selectedBorderColor === color.value
												? "border-blue-500 ring-2 ring-blue-200"
												: "border-gray-200 hover:border-gray-300",
										)}
										style={{ backgroundColor: color.value }}
									>
										{color.value === "transparent" && (
											<div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 opacity-50" />
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* 背景颜色部分 */}
					{showBackgroundColor && (
						<div className="space-y-2">
							<span className="text-sm font-medium text-gray-700">
								背景颜色
							</span>
							<div className="space-y-1">
								{backgroundColors.map((row, rowIndex) => (
									<div key={rowIndex} className="flex gap-1">
										{row.map((color) => (
											<button
												key={color.value}
												onClick={() => handleBackgroundColorSelect(color.value)}
												className={cn(
													"w-8 h-8 rounded border-2 transition-all hover:scale-105",
													selectedBackgroundColor === color.value
														? "border-blue-500 ring-2 ring-blue-200"
														: "border-gray-200 hover:border-gray-300",
												)}
												style={{ backgroundColor: color.value }}
											>
												{color.value === "transparent" && (
													<div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 opacity-50" />
												)}
											</button>
										))}
									</div>
								))}
							</div>
						</div>
					)}

					{/* 重置按钮 */}
					<div className="pt-2">
						<Button
							variant="outline"
							onClick={handleReset}
							className="w-full text-sm text-gray-600 hover:text-gray-800"
						>
							重置
						</Button>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export default ColorPicker;
