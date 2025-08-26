import type { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import {
	ChevronDown,
	Heading as HeadingIcon,
	Heading1,
	Heading2,
	Heading3,
	List as ListIcon,
	ListOrdered,
	Quote,
} from "lucide-react";

interface Props {
	editor: Editor | null;
}

interface HeadingOption {
	level: 1 | 2 | 3;
	label: string;
	icon: React.ReactNode;
}

export default function Heading({ editor }: Props) {
	const [isHover, setIsHover] = useState(false);
	const [position, setPosition] = useState<"top" | "bottom">("bottom");
	const timeoutRef = useRef<number | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const headings: HeadingOption[] = [
		{ level: 1, label: "一级标题", icon: <Heading1 className="h-4 w-4" /> },
		{ level: 2, label: "二级标题", icon: <Heading2 className="h-4 w-4" /> },
		{ level: 3, label: "三级标题", icon: <Heading3 className="h-4 w-4" /> },
	];

	const paragraphIcon = <HeadingIcon className="h-4 w-4" />;

	const currentIcon = () => {
		if (!editor) return paragraphIcon;
		if (editor.isActive("paragraph")) return paragraphIcon;
		const activeHeading = headings.find(({ level }) =>
			editor.isActive("heading", { level }),
		);
		return activeHeading?.icon ?? paragraphIcon;
	};

	const handleMouseEnter = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		setIsHover(true);
	};

	const handleMouseLeave = () => {
		timeoutRef.current = window.setTimeout(() => setIsHover(false), 150);
	};

	// 根据光标位置动态决定菜单显示在上方还是下方
	useEffect(() => {
		if (!isHover || !menuRef.current || !editor) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		const menuHeight = menuRef.current.offsetHeight;
		const viewportHeight = window.innerHeight;

		if (rect.bottom + menuHeight + 8 > viewportHeight) {
			setPosition("top");
		} else {
			setPosition("bottom");
		}
	}, [isHover, editor]);

	if (!editor) return null;

	return (
		<span
			className="relative inline-block"
			role="group"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* 触发按钮 */}
			<button
				type="button"
				className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors "
				title="标题样式"
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

			{/* 下拉面板 */}
			<div
				ref={menuRef}
				className={`absolute left-1/2 transform -translate-x-1/2 bg-white border rounded-md shadow-lg z-50 min-w-32
							transition-all duration-200 ease-out
							${
								position === "bottom"
									? "origin-top mt-3"
									: "origin-bottom mb-3 bottom-full"
							}
							${
								isHover
									? "opacity-100 translate-y-0 pointer-events-auto"
									: "opacity-0 -translate-y-2 pointer-events-none"
							}`}
				role="menu"
			>
				{/* 正文 */}
				<button
					type="button"
					role="menuitem"
					className={`w-full text-left px-5 py-2 text-sm transition-colors ${
						editor.isActive("paragraph")
							? "bg-blue-100 text-blue-600"
							: "hover:bg-gray-100"
					}`}
					onClick={() => editor.chain().focus().setParagraph().run()}
				>
					<div className="flex items-center gap-4 whitespace-nowrap">
						{paragraphIcon}
						<span>正文</span>
					</div>
				</button>

				{/* 标题选项 */}
				{headings.map(({ level, label, icon }) => {
					const isActive = editor.isActive("heading", { level });
					return (
						<button
							key={label}
							type="button"
							role="menuitem"
							className={`w-full text-left px-5 py-2 text-sm transition-colors ${
								isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
							}`}
							onClick={() =>
								editor.chain().focus().toggleHeading({ level }).run()
							}
						>
							<div className="flex items-center gap-4 whitespace-nowrap">
								{icon}
								<span>{label}</span>
							</div>
						</button>
					);
				})}
				{/* 有序列表 */}
				<button
					type="button"
					role="menuitem"
					className={` w-full text-left px-5 py-2 text-sm transition-colors ${
						editor.isActive("bulletList")
							? "bg-blue-100 text-blue-600"
							: "hover:bg-gray-100"
					}`}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<div className="flex items-center gap-4 whitespace-nowrap">
						<ListOrdered className="h-4 w-4" />
						<span>有序列表</span>
					</div>
				</button>
				{/* 无序列表 */}
				<button
					type="button"
					role="menuitem"
					className={` w-full text-left px-5 py-2 text-sm transition-colors ${
						editor.isActive("bulletList")
							? "bg-blue-100 text-blue-600"
							: "hover:bg-gray-100"
					}`}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<div className="flex items-center gap-4 whitespace-nowrap">
						<ListIcon className="h-4 w-4" />
						<span>无序列表</span>
					</div>
				</button>

				<div className="my-1 border-t" />
				<button
					type="button"
					role="menuitem"
					className={` w-full text-left px-5 py-2 text-sm transition-colors ${
						editor.isActive("blockquote")
							? " bg-blue-100 text-blue-600"
							: "hover:bg-gray-100"
					}`}
					onClick={() => {
						if (editor.isActive("blockquote")) {
							editor.chain().focus().setParagraph().run();
						} else {
							editor.chain().focus().setBlockquote().run();
						}
					}}
				>
					<div className="flex items-center gap-4 whitespace-nowrap">
						<Quote className="h-4 w-4 " />
						<span>引用</span>
					</div>
				</button>
			</div>
		</span>
	);
}
