// 颜色选择器配置文件

export interface ColorOption {
	value: string;
	label: string;
}

// 文字颜色选项
export const textColors: ColorOption[] = [
	{ value: "#1e40af", label: "深蓝" },
	{ value: "#6b7280", label: "灰色" },
	{ value: "#dc2626", label: "红色" },
	{ value: "#ea580c", label: "橙色" },
	{ value: "#ca8a04", label: "黄色" },
	{ value: "#16a34a", label: "绿色" },
	{ value: "#2563eb", label: "蓝色" },
	{ value: "#9333ea", label: "紫色" },
	{ value: "#7c3aed", label: "紫罗兰" },
];

// 边框颜色选项
export const borderColors: ColorOption[] = [
	{ value: "transparent", label: "透明" },
	{ value: "#d1d5db", label: "浅灰" },
	{ value: "#fca5a5", label: "浅红" },
	{ value: "#fdba74", label: "浅橙" },
	{ value: "#fde047", label: "浅黄" },
	{ value: "#86efac", label: "浅绿" },
	{ value: "#93c5fd", label: "浅蓝" },
	{ value: "#c4b5fd", label: "浅紫" },
	{ value: "#a78bfa", label: "浅紫罗兰" },
];

// 背景颜色选项
export const backgroundColors: ColorOption[][] = [
	// 第一行 - 浅色系
	[
		{ value: "transparent", label: "透明" },
		{ value: "#ffffff", label: "白色" },
		{ value: "#fef2f2", label: "浅粉" },
		{ value: "#fff7ed", label: "浅橙" },
		{ value: "#fefce8", label: "浅黄" },
		{ value: "#f0fdf4", label: "浅绿" },
		{ value: "#eff6ff", label: "浅蓝" },
		{ value: "#faf5ff", label: "浅紫" },
		{ value: "#f3e8ff", label: "浅紫罗兰" },
	],
	// 第二行 - 深色系
	[
		{ value: "#f3f4f6", label: "浅灰" },
		{ value: "#9ca3af", label: "灰色" },
		{ value: "#f87171", label: "红色" },
		{ value: "#fb923c", label: "橙色" },
		{ value: "#facc15", label: "黄色" },
		{ value: "#4ade80", label: "绿色" },
		{ value: "#60a5fa", label: "蓝色" },
		{ value: "#a78bfa", label: "紫色" },
		{ value: "#8b5cf6", label: "紫罗兰" },
	],
];

// 默认颜色配置
export const defaultColors = {
	text: "#1e40af",
	border: "#fb923c",
	background: "#fff7ed",
} as const;

// 重置颜色配置
export const resetColors = {
	text: "#1e40af",
	border: "#fb923c",
	background: "#fff7ed",
} as const;
