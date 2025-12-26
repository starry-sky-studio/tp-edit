import type { Node } from "@tiptap/pm/model";
import {
	type Editor,
	NodeViewWrapper,
	type ReactNodeViewProps
} from "@tiptap/react";
import clsx from "clsx";
import { startTransition, useCallback, useEffect, useState } from "react";

interface ImageBlockViewProps extends ReactNodeViewProps {
	editor: Editor;
	getPos: () => number | undefined;
	node: Node;
	updateAttributes: (attrs: Record<string, any>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
	const { editor, getPos, node, updateAttributes } = props;
	const { src, width, align, alt } = node.attrs;
	const [isSelected, setIsSelected] = useState(false);
	useEffect(() => {
		const updateSelection = () => {
			const pos = getPos();
			if (pos !== undefined) {
				const { from, to } = editor.state.selection;
				const isNodeSelected = from <= pos && to >= pos + node.nodeSize;
				// 使用 startTransition 延迟状态更新，避免在渲染期间同步更新
				startTransition(() => {
					setIsSelected(isNodeSelected);
				});
			}
		};

		editor.on("selectionUpdate", updateSelection);
		// 初始调用也需要延迟
		startTransition(() => {
			updateSelection();
		});

		return () => {
			editor.off("selectionUpdate", updateSelection);
		};
	}, [editor, getPos, node.nodeSize]);

	useEffect(() => {
		if (!node.attrs.width || node.attrs.width === "100%") {
			const img = new window.Image();
			img.src = node.attrs.src;
			img.onload = () => {
				updateAttributes({ width: `${img.naturalWidth}px` });
			};
		}
	}, [node.attrs.src, node.attrs.width, updateAttributes]);

	const wrapperClassName = clsx(
		"",
		align === "left" && "ml-0 mr-auto flex justify-start",
		align === "right" && "ml-auto mr-0 flex justify-end",
		align === "center" && "mx-auto flex justify-center",
		"items-center relative my-2"
	);

	const imageClassName = clsx(
		"block cursor-pointer relative transition-all duration-200",
		isSelected && "ring-2 ring-blue-500 ring-offset-2"
	);

	const onClick = useCallback(() => {
		const pos = getPos();
		if (pos !== undefined) {
			editor.commands.setNodeSelection(pos);
		}
	}, [getPos, editor.commands]);

	return (
		<NodeViewWrapper>
			<div className={wrapperClassName} data-drag-handle>
				<div
					contentEditable={false}
					className={imageClassName}
					style={{ width }}
				>
					<img
						className="block w-full h-auto cursor-pointer transition-opacity"
						src={src}
						alt={alt || ""}
						onClick={onClick}
						loading="lazy"
						decoding="async"
					/>
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export default ImageBlockView;
