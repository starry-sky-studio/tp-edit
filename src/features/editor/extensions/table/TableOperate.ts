export type GripStyleOverrides = Partial<CSSStyleDeclaration>;

import { addTableColumn, addTableRow } from "@/utils";
//主要添加table 行列头部的自己元素操作 点击可以选择改行或者改列

export interface CreateGripOptions {
	className: string;
	selected: boolean;
	onMouseDown: (event: MouseEvent) => void;
	styleOverrides?: GripStyleOverrides;
}

export interface CreateAddButtonOptions {
	text?: string;
	className?: string;
	style?: Record<string, string>;
	onClick?: () => void;
	index?: number;
	editor?: any;
}

/**
 * 创建列选择 grip（仅负责选择交互，不包含其他子元素）
 * 由调用方负责把它作为 Decoration.widget 的返回 DOM 使用
 */
export const createColumnsGrip = (
	options: CreateGripOptions,
): HTMLAnchorElement => {
	const { className, selected, onMouseDown, styleOverrides } = options;

	const grip = document.createElement("a");
	grip.className = `${className} grid`;
	grip.style.cssText = `
    position: absolute;
    top: -12px;
    left: 0;
    right: -1px;
    height: 12px;
    background-color: ${selected ? "var(--color-primary)" : "#f5f5f5"};
    border-right: 1px solid oklch(0.922 0 0);
    pointer-events: auto;
    cursor: pointer;
    text-decoration: none;
		transition: background-color 0.2s ease;
  `;

	if (styleOverrides) {
		Object.entries(styleOverrides).forEach(([k, v]) => {
			// @ts-expect-error 动态赋值
			grip.style[k] = v as any;
		});
	}
	//鼠标划过 颜色变成 --color-primary
	grip.addEventListener("mouseover", () => {
		grip.style.backgroundColor = "var(--color-primary)";
	});

	grip.addEventListener("mouseout", () => {
		grip.style.backgroundColor = selected ? "var(--color-primary)" : "#f5f5f5";
	});

	grip.addEventListener("mousedown", (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		onMouseDown(event);
	});

	return grip;
};

/**
 * 创建行选择 grip
 * 由调用方负责把它作为 Decoration.widget 的返回 DOM 使用
 */
export const createRowGrip = (
	options: CreateGripOptions,
): HTMLAnchorElement => {
	const { className, selected, onMouseDown, styleOverrides } = options;

	const grip = document.createElement("a");
	grip.className = className;
	grip.style.cssText = `
		position: absolute;
		left: -12px;
		top: 0;
		width: 12px;
		height: 100%;
		background-color: ${selected ? "var(--color-primary)" : "#f5f5f5"};
		border-bottom: 1px solid oklch(0.922 0 0);
		cursor: pointer;
		text-decoration: none;
		transition: background-color 0.2s ease;
	`;

	if (styleOverrides) {
		Object.entries(styleOverrides).forEach(([k, v]) => {
			// @ts-expect-error 动态赋值
			grip.style[k] = v as any;
		});
	}

	grip.addEventListener("mouseover", () => {
		grip.style.backgroundColor = "var(--color-primary)";
	});

	grip.addEventListener("mouseout", () => {
		grip.style.backgroundColor = selected ? "var(--color-primary)" : "#f5f5f5";
	});

	grip.addEventListener("mousedown", (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		onMouseDown(event);
	});

	return grip;
};

/**
 * 创建添加行按钮（带悬停提示）
 * 返回包含 element 和 cleanup 函数的对象
 */
export const createAddRowButton = (
	options: CreateAddButtonOptions,
): { element: HTMLDivElement; cleanup: () => void } => {
	const {
		text = "添加行",
		className = "grip-pseudo rounded-full size-4 absolute bg-green-100",
		style = {},
		onClick,
		index,
		editor,
	} = options;

	const buttonElement = document.createElement("div");
	let mounted = true;
	let rafId: number | null = null;

	buttonElement.className = className;

	// 将 React.CSSProperties 的 camelCase 转为 CSS kebab-case
	const overrideCss = Object.entries(style)
		.map(
			([key, value]) =>
				`${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${value}`,
		)
		.join("; ");

	buttonElement.style.cssText = `
		position: absolute;
		top: -12px;
		left: 0%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
	  background-color: #dddddd;
		border-radius: 50%;
		transition: all 0.2s ease;
		cursor: pointer;
		${overrideCss}
	`;

	const tooltip = document.createElement("div");
	tooltip.className = "custom-tooltip";
	tooltip.textContent = text;
	tooltip.style.cssText = `
		position: absolute;
		top: -12px;
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

	const onMouseOver = (e: MouseEvent) => {
		e.stopPropagation();
		buttonElement.style.transform = "translate(-50%, -50%) scale(3)";
		buttonElement.style.backgroundColor = "var(--color-primary)";
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			if (!mounted) return;
			const rect = buttonElement.getBoundingClientRect();
			tooltip.style.position = "fixed";
			tooltip.style.top = `${Math.round(rect.top - 10)}px`;
			tooltip.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
			tooltip.style.transform = "translate(-50%, -100%)";
			tooltip.style.opacity = "1";
		});
	};
	buttonElement.addEventListener("mouseover", onMouseOver as any);

	const onMouseOut = (e: MouseEvent) => {
		e.stopPropagation();
		buttonElement.style.transform = "translate(-50%, -50%) scale(1)";
		buttonElement.style.backgroundColor = "#dddddd";
		tooltip.style.opacity = "0";
	};
	buttonElement.addEventListener("mouseout", onMouseOut as any);

	const onMouseDown = (e: MouseEvent) => {
		e.stopPropagation();
		onClick?.();
		if (index !== undefined && editor) {
			addTableRow(editor, index);
		}
	};
	buttonElement.addEventListener("mousedown", onMouseDown as any);

	// 如果按钮在点击后被重绘/移除，保证提示也隐藏（与添加列逻辑一致）
	const observer = new MutationObserver(() => {
		if (!mounted) return;
		if (!buttonElement.isConnected && tooltip.style.opacity !== "0") {
			tooltip.style.opacity = "0";
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });

	document.body.appendChild(tooltip);

	return {
		element: buttonElement,
		cleanup: () => {
			mounted = false;
			if (rafId) cancelAnimationFrame(rafId);
			buttonElement.removeEventListener("mouseover", onMouseOver as any);
			buttonElement.removeEventListener("mouseout", onMouseOut as any);
			buttonElement.removeEventListener("mousedown", onMouseDown as any);
			observer.disconnect();
			if (tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		},
	};
};

/**
 * 创建添加列按钮（带悬停提示）
 * 返回包含 element 和 cleanup 函数的对象
 */
export const createAddColumnButton = ({
	text = "添加列",
	className = "grip-pseudo rounded-full size-4 absolute bg-green-100",
	style = {},
	onClick,
	index,
	editor,
}: CreateAddButtonOptions) => {
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
			top: -20px;
			left: 0%;
			transform: translate(-50%, -50%);
			width: 6px;
			height: 6px;
			background-color: #dddddd;
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

	let isHovering = false;

	const onMouseOver = (e: MouseEvent) => {
		e.stopPropagation();
		isHovering = true;
		tooltipElement.style.transform = "translate(-50%, -50%) scale(3)";
		tooltipElement.style.backgroundColor = "var(--color-primary)";
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
		isHovering = false;
		tooltipElement.style.transform = "translate(-50%, -50%) scale(1)";
		tooltipElement.style.backgroundColor = "#dddddd";
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

	// 如果按钮在点击后被重绘/移除，保证提示也隐藏
	const observer = new MutationObserver(() => {
		if (!mounted) return;
		if (!tooltipElement.isConnected && tooltip.style.opacity !== "0") {
			tooltip.style.opacity = "0";
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });

	document.body.appendChild(tooltip);

	return {
		element: tooltipElement,
		cleanup: () => {
			mounted = false;
			if (rafId) cancelAnimationFrame(rafId);
			tooltipElement.removeEventListener("mouseover", onMouseOver as any);
			tooltipElement.removeEventListener("mouseout", onMouseOut as any);
			tooltipElement.removeEventListener("mousedown", onMouseDown as any);
			observer.disconnect();
			// 确保移除前隐藏
			tooltip.style.opacity = "0";
			if (tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		},
	};
};
