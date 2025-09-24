"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Loading } from "@/styles/svg";
import Footer from "./components/Footer";
import BubbleMenu from "./components/Menus/BubbleMenu/index";
import FixedMenuComp from "./components/Menus/FixedMenu/index";
import { baseExtensions } from "./extensions";

const Tiptap = () => {
	const [mounted, setMounted] = useState(false);

	const editor = useEditor({
		extensions: baseExtensions,
		content: "<p>Hello World! 🌎️</p>",
		editorProps: {
			attributes: {
				class:
					"prose w-full min-h-[calc(100vh-84px)] prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-white focus:outline-none p-3 text-sm sm:p-4 sm:text-base md:p-6 md:text-base lg:p-8 lg:text-lg xl:p-10 xl:text-xl 2xl:p-12 2xl:text-2xl",
			},
		},
		autofocus: true,
		editable: true,
		// Don't render immediately on the server to avoid SSR issues
		immediatelyRender: false,
		injectCSS: true, // 注入默认样式（推荐保持true）
	});

	// 确保只在客户端渲染
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted)
		return (
			<div className="h-screen flex w-screen animate-pulse items-center justify-center bg-white p-4">
				<Loading
					style={{ color: "var(--color-primary)" }}
					className="text-7xl"
				/>
			</div>
		);

	return (
		<div className="w-full h-full shadow-sm relative max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-8xl">
			<div className="sticky top-0 z-50 bg-white border-b border-gray-200  px-2 py-1">
				<FixedMenuComp editor={editor} />
			</div>
			<div className="relative flex-1 ">
				<BubbleMenu editor={editor} />
				<EditorContent
					className="w-full [&_.ProseMirror]:w-full [&_.ProseMirror]:max-w-none"
					editor={editor}
				/>
			</div>
			<div className="sticky bottom-0 z-50 bg-white border-t border-gray-200  px-2 py-1">
				<Footer />
			</div>
		</div>
	);
};

export default Tiptap;
