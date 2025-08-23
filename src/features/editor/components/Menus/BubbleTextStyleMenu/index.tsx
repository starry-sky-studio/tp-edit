import type { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { Palette, Slash } from "lucide-react";

interface Props {
	editor: Editor | null;
}

export function BubbleTextStyleMenu({ editor }: Props) {
	const [isHover, setIsHover] = useState(false);
	const [position, setPosition] = useState<"top" | "bottom">("bottom");
	const timeoutRef = useRef<number | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const fontColors = [
		"#364152",
		"#bbbfc3",
		"#d83a31",
		"#dd7801",
		"#dc9b03",
		"#2fa120",
		"#245bdb",
		"#6325d0",
	];

	const highlightColors = [
		"#f2f3f5",
		"#fbbfbd",
		"#ffddb6",
		"#fff897",
		"#c6f0c1",
		"#cedcfe",
		"#dcc9fc",
		"#e5e6e8",
		"#bbbfc3",
		"#f76964",
		"#ffa53d",
		"#ffe928",
		"#63d256",
		"#a0bbfe",
		"#c4a5fb",
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
				className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
				title="字体与背景颜色"
				aria-haspopup="true"
				aria-expanded={isHover}
			>
				<Palette className="h-4 w-4 text-gray-600" />
			</button>

			{/* 下拉菜单 */}
			<div
				ref={menuRef}
				className={`absolute left-1/2 -translate-x-1/2 bg-white border rounded-md shadow-lg p-3 min-w-64 z-50
                    transition-all duration-200 ease-out
                    ${position === "bottom" ? "origin-top mt-3" : "origin-bottom mb-3 bottom-full"}
                    ${
											isHover
												? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
												: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
										}`}
				onClick={(e) => e.stopPropagation()}
				role="menu"
				aria-hidden={!isHover}
			>
				{/* 字体颜色 */}
				<div className="mb-3">
					<div className="text-xs font-medium text-gray-700 mb-1">字体颜色</div>
					<div className="grid grid-cols-8 gap-1">
						{fontColors.map((color) => (
							<button
								key={`font-${color}`}
								type="button"
								role="menuitem"
								className={`rounded cursor-pointer flex items-center justify-center
                            transition-transform duration-200
                            ${
															editor.isActive("textStyle", { color })
																? "border-2 border-[#336df4] bg-white"
																: "hover:scale-110 hover:border-2 hover:border-[#336df4] hover:bg-white"
														}`}
								style={{ width: 26, height: 26 }}
								onClick={() => editor.chain().focus().setColor(color).run()}
								title={`字体颜色: ${color}`}
							>
								<div
									className="rounded"
									style={{ backgroundColor: color, width: 20, height: 20 }}
								/>
							</button>
						))}
					</div>
				</div>

				{/* 背景颜色 */}
				<div className="border-t pt-2">
					<div className="text-xs font-medium text-gray-700 mb-1">背景颜色</div>
					<div className="grid grid-cols-8 gap-1">
						<button
							type="button"
							role="menuitem"
							className="flex items-center justify-center border rounded cursor-pointer"
							style={{ width: 24, height: 24 }}
							onClick={() => editor.chain().focus().unsetHighlight().run()}
							title="清除高亮"
						>
							<Slash className="h-4 w-4 text-gray-600" />
						</button>
						{highlightColors.map((color) => (
							<button
								key={`highlight-${color}`}
								type="button"
								role="menuitem"
								className={`rounded cursor-pointer flex items-center justify-center
                            transition-transform duration-200
                            ${
															editor.isActive("highlight", { color })
																? "border-2 border-[#336df4] bg-white"
																: "hover:scale-110 hover:border-2 hover:border-[#336df4] hover:bg-white"
														}`}
								style={{ width: 26, height: 26 }}
								onClick={() =>
									editor.chain().focus().toggleHighlight({ color }).run()
								}
								title={`高亮颜色: ${color}`}
							>
								<div
									className="rounded"
									style={{ backgroundColor: color, width: 20, height: 20 }}
								/>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
