/**
 * 定义选区元素类型常量，用于 getSelectionElementType 函数的返回值。
 * 作用：提高代码可读性和类型安全性，作为返回值类型枚举（Enum）。
 */
export const SelectionType = {
	// 块级容器（通常包含文本）
	PARAGRAPH: "paragraph",
	HEADING: "heading",
	LIST_ITEM: "listItem",
	BLOCKQUOTE: "blockquote",
	CODE_BLOCK: "codeBlock",

	// 独立节点
	IMAGE: "image",
	TABLE: "table",
	HORIZONTAL_RULE: "horizontalRule",
} as const;

// 联合类型，用于函数签名
export type SelectionElementType =
	| (typeof SelectionType)[keyof typeof SelectionType]
	| string;
