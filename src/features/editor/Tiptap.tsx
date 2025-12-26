"use client";

import Footer from "@/components/Footer";
import { useImageControls } from "@/hooks/use-image-controls";
import { useImageSelection } from "@/hooks/use-image-selection";
import { Loading } from "@/styles/svg";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";
import CalloutMenu from "./components/Callout/callout-menu";
import BubbleMenuComp from "./components/Menus/BubbleMenu/index";
import FixedMenuComp from "./components/Menus/FixedMenu/index";
import { baseExtensions } from "./extensions";

const Tiptap = () => {
	const [mounted, setMounted] = useState(false);

	// 1. 将 editorProps 提取出来，或者使用 useMemo 包裹
	// 避免每次组件重渲染导致 useEditor 以为配置变了而触发更新
	const editorProps = useMemo(
		() => ({
			attributes: {
				class:
					"prose w-full min-h-[calc(100vh-84px)] prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-white focus:outline-none p-3 text-sm sm:p-4 sm:text-base md:p-6 md:text-base lg:p-8 lg:text-lg xl:p-10 xl:text-xl 2xl:p-12 2xl:text-2xl"
			}
		}),
		[]
	);

	const editor = useEditor({
		extensions: baseExtensions,
		content: `<p>Hello World! 🌎️</p>...`, // 省略内容，保持原样即可
		editorProps: editorProps,
		// 2. 重点：必须禁用 autofocus，防止在挂载期触发 flushSync
		autofocus: false,
		editable: true,
		immediatelyRender: false,
		injectCSS: true
	});

	// 3. 处理自动聚焦的正确方式：等待编辑器挂载完成后，在 Effect 中执行
	useEffect(() => {
		if (editor && !editor.isDestroyed) {
			// 使用 setTimeout 将聚焦推迟到下一个事件循环，彻底避开 React 渲染阶段
			setTimeout(() => {
				editor.commands.focus();
			}, 0);
		}
	}, [editor]);

	// 处理 SSR 挂载
	useEffect(() => {
		setMounted(true);
	}, []);

	const { selectedImageNode, imageDom, hoveredImageNode, hoveredImageDom } =
		useImageSelection(editor);

	useImageControls({
		imageDom,
		selectedImageNode,
		hoveredImageDom,
		hoveredImageNode,
		editor
	});

	if (!mounted) {
		return (
			<div className="h-screen flex w-screen animate-pulse items-center justify-center bg-white p-4">
				<Loading
					style={{ color: "var(--color-primary)" }}
					className="text-7xl"
				/>
			</div>
		);
	}

	return (
		<div className="w-full h-full shadow-sm relative max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl 2xl:max-w-8xl">
			{editor && (
				<div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-1">
					<FixedMenuComp editor={editor} />
					<BubbleMenuComp editor={editor} />
					<CalloutMenu editor={editor} />
				</div>
			)}
			<div className="relative flex-1">
				{editor ? (
					<EditorContent
						className="w-full [&_.ProseMirror]:w-full [&_.ProseMirror]:max-w-none"
						editor={editor}
					/>
				) : (
					<div className="w-full min-h-[calc(100vh-84px)] bg-white" />
				)}
			</div>
			<div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-2 py-1">
				<Footer />
			</div>
		</div>
	);
};

export default Tiptap;
