import { useEventListener, useThrottleFn } from "ahooks";
import { useCallback, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ImgAlign } from "@/features/editor/components/Menus/Common";

interface UseImageControlsProps {
	imageDom: HTMLElement | null;
	selectedImageNode: any;
	hoveredImageDom: HTMLElement | null;
	hoveredImageNode: any;
	editor: any;
}

export const useImageControls = ({
	imageDom,
	selectedImageNode,
	hoveredImageDom,
	hoveredImageNode,
	editor,
}: UseImageControlsProps) => {
	const rootRef = useRef<any>(null);
	const editorRef = useRef<any>(editor);
	editorRef.current = editor;

	// 拖拽过程所需的上下文
	const isDraggingRef = useRef<boolean>(false);
	const dragSideRef = useRef<"left" | "right">("right");
	const startXRef = useRef<number>(0);
	const startWRef = useRef<number>(0);
	const totalRef = useRef<number>(0);

	// 节流的全局 mousemove 处理
	const { run: handleGlobalMouseMove } = useThrottleFn(
		(ev: MouseEvent) => {
			if (!isDraggingRef.current) return;
			const side = dragSideRef.current;
			const startX = startXRef.current;
			const startW = startWRef.current;
			const total = totalRef.current;

			const dx = ev.clientX - startX;
			const delta = side === "right" ? dx : -dx;
			const newW = Math.max(20, Math.min(total, startW + delta));
			const percent = Math.max(
				0,
				Math.min(100, Math.round((newW / total) * 100)),
			);

			editorRef.current?.commands.updateAttributes("imageBlock", {
				width: `${percent}%`,
			});
		},
		{ wait: 16, leading: true, trailing: true },
	);

	// 顶层监听，不随拖拽函数重建
	useEventListener("mousemove", handleGlobalMouseMove, {
		target: () => document,
	});

	useEventListener(
		"mouseup",
		() => {
			if (!isDraggingRef.current) return;
			isDraggingRef.current = false;
			editorRef.current?.commands.focus();
		},
		{ target: () => document },
	);

	const startResize = useCallback(
		(side: "left" | "right") => (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			// 使用当前目标图片（选中或悬停）
			const targetImageDom = imageDom || hoveredImageDom;
			const targetImageNode = selectedImageNode || hoveredImageNode;

			if (!targetImageNode || !targetImageDom) return;

			const startX = e.clientX;
			const rect = targetImageDom.getBoundingClientRect();
			const startW = rect.width;
			const editorRect = editor.view.dom.getBoundingClientRect();
			const total = editorRect.width;

			// 初始化拖拽上下文
			isDraggingRef.current = true;
			dragSideRef.current = side;
			startXRef.current = startX;
			startWRef.current = startW;
			totalRef.current = total;
		},
		[editor, selectedImageNode, imageDom, hoveredImageNode, hoveredImageDom],
	);

	// 渲染控制组件
	useEffect(() => {
		// 优先显示选中的图片，其次显示悬停的图片
		const targetImageDom = imageDom || hoveredImageDom;
		const targetImageNode = selectedImageNode || hoveredImageNode;

		if (!targetImageDom || !targetImageNode) {
			// 清理之前的渲染
			if (rootRef.current) {
				setTimeout(() => {
					if (rootRef.current) {
						rootRef.current.unmount();
						rootRef.current = null;
					}
				}, 0);
			}
			return;
		}

		// 延迟创建控制元素，确保图片完全加载
		const timer = setTimeout(() => {
			createControls();
		}, 100);

		function createControls() {
			if (!targetImageDom) return;

			// 清理之前的控制元素
			const existingControls = targetImageDom.parentNode?.querySelector(
				".image-controls-container",
			);
			if (existingControls) {
				existingControls.remove();
			}

			// 确保父元素有正确的定位上下文
			const parentElement = targetImageDom.parentNode as HTMLElement;
			if (parentElement) {
				const computedStyle = window.getComputedStyle(parentElement);
				if (computedStyle.position === "static") {
					parentElement.style.position = "relative";
				}
			}

			// 创建控制组件容器
			const controlsContainer = document.createElement("div");
			controlsContainer.className = "image-controls-container";
			controlsContainer.style.position = "absolute";
			controlsContainer.style.top = "0";
			controlsContainer.style.left = "0";
			controlsContainer.style.width = "100%";
			controlsContainer.style.height = "100%";
			controlsContainer.style.pointerEvents = "none";
			controlsContainer.style.zIndex = "10";

			// 将容器插入到图片的父元素中，作为绝对定位的覆盖层
			targetImageDom.parentNode?.appendChild(controlsContainer);

			// 创建React root并渲染控制组件
			const newRoot = createRoot(controlsContainer);
			rootRef.current = newRoot;

			newRoot.render(
				<div className="relative  w-full h-full pointer-events-none">
					<div
						className="absolute top-1/2 -translate-y-1/2 left-2 w-1 h-1/5 bg-gray-400 opacity-50 rounded-full cursor-ew-resize pointer-events-auto shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-400"
						onMouseDown={startResize("left")}
					/>
					<div
						className="absolute top-1/2 -translate-y-1/2 right-2 w-1 h-1/5 bg-gray-400 opacity-50 rounded-full cursor-ew-resize pointer-events-auto shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-400"
						onMouseDown={startResize("right")}
					/>

					<div className="absolute -top-10 bg-white -translate-y-1 translate-x-1/2 right-1/2 pointer-events-auto border shadow-sm rounded-md">
						<ImgAlign editor={editor} />
					</div>
				</div>,
			);
		}

		return () => {
			clearTimeout(timer);
			setTimeout(() => {
				if (rootRef.current) {
					rootRef.current.unmount();
					rootRef.current = null;
				}
			}, 0);
		};
	}, [
		imageDom,
		selectedImageNode,
		hoveredImageDom,
		hoveredImageNode,
		editor,
		startResize,
	]);

	return {
		startResize,
	};
};
