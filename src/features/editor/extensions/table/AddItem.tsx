import clsx from "clsx";

interface CreateTooltipElementProps {
	text?: string;
	className?: string;
	style?: React.CSSProperties;
	onClick?: () => void;
}

// DOM 元素版本，用于 ProseMirror decorations
export const createTooltipElement = ({
	text = "添加列",
	className = "grip-pseudo rounded-full size-4 absolute bg-green-100",
	style = {},
	onClick,
}: CreateTooltipElementProps) => {
	// 创建容器元素
	// const container = document.createElement("div");
	// container.style.cssText = `
	// 	position: absolute;
	//   top: -50%;
	// 	left: 0%;
	// 	transform: translate(-50%, -50%);
	// 	width: 6px;
	// 	height: 6px;
	//   border-radius: 50%;
	//   transition: all 0.2s ease;
	// `;

	// 创建可交互的元素
	const tooltipElement = document.createElement("div");
	tooltipElement.className = className;
	tooltipElement.style.cssText = `
		position: absolute;
		top: -50%;
		left: 0%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		background-color: pink;
    border-radius: 50%;'
    transition: all 0.2s ease;
		cursor: pointer;
		${Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join("; ")}
	`;

	// 创建 Tooltip 提示框
	const tooltip = document.createElement("div");
	tooltip.className = "custom-tooltip";
	tooltip.textContent = text;
	tooltip.style.cssText = `
		position: fixed;
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

	tooltip.addEventListener("mouseleave", () => {
		tooltip.style.transform = "translate(-50%, -50%) scale(1)";
	});

	tooltip.addEventListener("mouseenter", () => {
		tooltip.style.transform = "translate(-50%, -50%) scale(3)";
	});

	// 添加鼠标事件
	tooltipElement.addEventListener("mouseenter", () => {
		tooltip.style.opacity = "1";
	});

	tooltipElement.addEventListener("mouseleave", () => {
		tooltip.style.opacity = "0";
	});

	tooltipElement.addEventListener("mousemove", (e) => {
		const width = tooltip.offsetWidth;
		tooltip.style.left = e.pageX - width / 2 + "px";
		tooltip.style.top = e.pageY - 36 + "px";
	});

	// 添加点击事件
	if (onClick) {
		tooltipElement.addEventListener("click", onClick);
	}

	// 将 tooltip 添加到 body，确保它能正确显示
	document.body.appendChild(tooltip);

	// 返回容器元素和清理函数
	return {
		element: tooltipElement,
		cleanup: () => {
			if (tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		},
	};
};
