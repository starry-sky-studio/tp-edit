"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { Loading } from "@/styles/svg";
import Footer from "./components/Footer";
import BubbleMenu from "./components/menus/BubbleMenu";
import FixedMenuComp from "./components/menus/FixedMenu";

const Tiptap = () => {
	const [mounted, setMounted] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
				codeBlock: false,
			}),
			Placeholder.configure({
				placeholder: "开始输入内容...",
				emptyEditorClass:
					"before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0",
			}),
		],
		content: "<p>Hello World! 🌎️</p>",
		editorProps: {
			attributes: {
				class:
					"prose w-full h-[calc(100vh-65px)] prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 min-h-[300px] bg-white border border-gray-300 focus:outline-none",
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
		<div className="relative h-screen w-[1200px] bg-white">
			<FixedMenuComp editor={editor} />
			<BubbleMenu editor={editor} />
			<EditorContent
				className="w-full [&_.ProseMirror]:w-full [&_.ProseMirror]:max-w-none"
				editor={editor}
			/>
			<Footer />
		</div>
	);
};

export default Tiptap;
