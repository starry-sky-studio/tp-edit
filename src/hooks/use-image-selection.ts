import { NodeSelection } from "@tiptap/pm/state";
import { startTransition, useCallback, useEffect, useState } from "react";

export const useImageSelection = (editor: any) => {
	const [selectedImageNode, setSelectedImageNode] = useState<any>(null);
	const [imageDom, setImageDom] = useState<HTMLElement | null>(null);
	const [hoveredImageNode, setHoveredImageNode] = useState<any>(null);
	const [hoveredImageDom, setHoveredImageDom] = useState<HTMLElement | null>(
		null
	);

	const updateSelection = useCallback(() => {
		if (!editor) return;

		// 使用 startTransition 延迟状态更新，避免在渲染期间同步更新
		startTransition(() => {
			const { state } = editor;
			const sel = state.selection;

			if (sel instanceof NodeSelection) {
				const node = sel.node;
				if (node.type.name === "imageBlock") {
					setSelectedImageNode(node);

					// 获取图片DOM元素 - 需要找到实际的img元素
					const dom = editor.view.nodeDOM(sel.from);
					if (dom) {
						// 如果是NodeViewWrapper，需要找到其中的img元素
						const imgElement = dom.querySelector("img") || dom;
						setImageDom(imgElement as HTMLElement);
					}
				} else {
					setSelectedImageNode(null);
					setImageDom(null);
				}
			} else {
				setSelectedImageNode(null);
				setImageDom(null);
			}
		});
	}, [editor]);

	// 处理鼠标悬停事件
	const handleMouseOver = useCallback(
		(e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// 检查是否在控制组件内
			if (target.closest(".image-controls-container")) {
				return; // 在控制组件内，不处理
			}

			// 查找图片元素 - 通过父容器的 data-node-type 属性
			const imageContainer = target.closest('[data-node-type="imageBlock"]');
			const img = imageContainer?.querySelector("img") || target.closest("img");

			if (img && img !== imageDom) {
				// 找到对应的节点
				const pos = editor.view.posAtDOM(img, 0);
				if (pos !== null) {
					const node = editor.view.state.doc.nodeAt(pos);
					if (node && node.type.name === "imageBlock") {
						// 使用 startTransition 延迟状态更新
						startTransition(() => {
							setHoveredImageNode(node);
							setHoveredImageDom(img as HTMLElement);
						});
					}
				}
			}
		},
		[editor, imageDom]
	);

	const handleMouseOut = useCallback((e: MouseEvent) => {
		const target = e.target as HTMLElement;

		// 检查是否移动到控制组件内
		if (target.closest(".image-controls-container")) {
			return; // 移动到控制组件内，不隐藏
		}

		// 检查是否离开了图片元素
		const imageContainer = target.closest('[data-node-type="imageBlock"]');
		const img = imageContainer?.querySelector("img") || target.closest("img");

		if (!img) {
			// 完全离开了图片元素，使用 startTransition 延迟状态更新
			startTransition(() => {
				setHoveredImageNode(null);
				setHoveredImageDom(null);
			});
		}
	}, []);

	useEffect(() => {
		if (!editor) return;

		editor.on("selectionUpdate", updateSelection);
		editor.on("update", updateSelection);
		editor.on("transaction", updateSelection); // 添加事务监听

		// 添加鼠标悬停事件监听
		const editorDom = editor.view.dom;
		editorDom.addEventListener("mouseover", handleMouseOver);
		editorDom.addEventListener("mouseout", handleMouseOut);

		return () => {
			editor?.off("selectionUpdate", updateSelection);
			editor?.off("update", updateSelection);
			editor?.off("transaction", updateSelection);

			editorDom.removeEventListener("mouseover", handleMouseOver);
			editorDom.removeEventListener("mouseout", handleMouseOut);
		};
	}, [editor, updateSelection, handleMouseOver, handleMouseOut]);

	return {
		selectedImageNode,
		imageDom,
		hoveredImageNode,
		hoveredImageDom
	};
};
