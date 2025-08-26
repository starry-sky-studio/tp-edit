import type { Editor } from "@tiptap/react";
import {
	Text as TextIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	ChevronDown,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Props {
	editor: Editor | null;
}

export function TextAlign({ editor }: Props) {
	const [isHover, setIsHover] = useState(false);
	const [position, setPosition] = useState<"top" | "bottom">("bottom");
	const timeoutRef = useRef<number | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const alignItems = [
		{ name: "左对齐", value: "left", icon: <AlignLeft className="h-4 w-4" /> },
		{
			name: "居中对齐",
			value: "center",
			icon: <AlignCenter className="h-4 w-4" />,
		},
		{
			name: "右对齐",
			value: "right",
			icon: <AlignRight className="h-4 w-4" />,
		},
		{
			name: "两端对齐",
			value: "justify",
			icon: <AlignJustify className="h-4 w-4" />,
		},
	];

	const handleMouseEnter = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsHover(true);
	};

	const handleMouseLeave = () => {
		timeoutRef.current = window.setTimeout(() => {
			setIsHover(false);
		}, 150);
	};

	// 动态判断菜单位置
	useEffect(() => {
		if (!isHover || !menuRef.current || !editor) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		const menuHeight = menuRef.current.offsetHeight;
		const viewportHeight = window.innerHeight;

		setPosition(
			rect.bottom + menuHeight + 8 > viewportHeight ? "top" : "bottom",
		);
	}, [isHover, editor]);

	const currentIcon = () => {
		if (!editor) return <TextIcon className="h-4 w-4" />;
		const activeAlign = alignItems.find(({ value }) =>
			editor.isActive({ textAlign: value }),
		);
		return activeAlign?.icon ?? <TextIcon className="h-4 w-4" />;
	};

	if (!editor) return null;

	return (
		<div
			className="relative inline-block"
			role="button"
			tabIndex={0}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* 触发按钮 */}
			<button
				type="button"
				className="flex items-center gap-1 p-1.5 hover:bg-gray-100 transition-colors rounded-md"
				title="对齐方式"
				aria-haspopup="true"
				aria-expanded={isHover}
			>
				{currentIcon()}
				<ChevronDown
					className={`h-3 w-3 text-gray-500 transform transition-transform duration-300 ease-in-out ${
						isHover ? "rotate-180" : "rotate-0"
					}`}
				/>
			</button>

			{/* 下拉菜单 */}
			<div
				ref={menuRef}
				className={`
                            absolute left-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32
                            transition-all duration-200 ease-out
                            ${position === "bottom" ? "origin-top mt-3" : "bottom-full mb-3 origin-bottom"}
                            ${isHover ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
                          `}
			>
				{alignItems.map((item) => {
					const isActive = editor.isActive({ textAlign: item.value });
					return (
						<button
							type="button"
							key={item.value}
							className={`flex w-full items-center gap-4 px-5 py-2 text-sm whitespace-nowrap
                                ${isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}
                            `}
							onClick={() => {
								editor.chain().focus().setTextAlign(item.value).run();
								setIsHover(false);
							}}
						>
							{item.icon}
							<span>{item.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
