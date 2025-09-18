import type { Node } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import {
	type Editor,
	NodeViewWrapper,
	type ReactNodeViewProps,
} from "@tiptap/react";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImgAlign } from "@/features/editor/components/Menus/Common";

interface ImageBlockViewProps extends ReactNodeViewProps {
	editor: Editor;
	getPos: () => number | undefined;
	node: Node;
	updateAttributes: (attrs: Record<string, any>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
	const { editor, getPos, node, updateAttributes } = props;
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);
	const { src, width, height, align, alt } = node.attrs;
	const [isSelected, setIsSelected] = useState(false);
	const [selectedNode, setSelectedNode] = useState<{
		type: string;
		isBlock: boolean;
	} | null>(null);

	useEffect(() => {
		const updateSelection = () => {
			const pos = getPos();
			if (pos !== undefined) {
				const { from, to } = editor.state.selection;
				const isNodeSelected = from <= pos && to >= pos + node.nodeSize;
				setIsSelected(isNodeSelected);
			}
		};

		editor.on("selectionUpdate", updateSelection);
		updateSelection();

		return () => {
			editor.off("selectionUpdate", updateSelection);
		};
	}, [editor, getPos, node.nodeSize]);

	useEffect(() => {
		if (node.attrs.width === "100%") {
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
		"items-center relative",
	);

	const imageClassName = clsx(
		"block cursor-pointer relative transition-all duration-200",
		isSelected && "ring-2 ring-blue-500 ring-offset-2",
	);

	const onClick = useCallback(() => {
		const pos = getPos();
		if (pos !== undefined) {
			editor.commands.setNodeSelection(pos);
		}
	}, [getPos, editor.commands]);

	const updateSelection = useCallback(() => {
		if (!editor) return;
		const { state } = editor;
		const sel = state.selection;

		let nodeInfo = null;

		if (sel instanceof NodeSelection) {
			const node = sel.node;
			console.log(node, "node");
			if (node.type.name === "image" || node.type.name === "imageBlock") {
				nodeInfo = {
					type: node.type.name,
					isBlock: node.type.name === "imageBlock",
				};
			}
		}

		setSelectedNode(nodeInfo);
	}, [editor]);

	const startResize = useCallback(
		(side: "left" | "right") => (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const container = imageContainerRef.current;
			if (!container) return;
			const line = container.parentElement as HTMLElement | null;
			const total = line?.clientWidth || container.clientWidth || 1;
			const rect = container.getBoundingClientRect();
			const startX = e.clientX;
			const startW = rect.width;
			const onMove = (ev: MouseEvent) => {
				const dx = ev.clientX - startX;
				const delta = side === "right" ? dx : -dx;
				const newW = Math.max(20, Math.min(total, startW + delta));
				const percent = Math.max(
					0,
					Math.min(100, Math.round((newW / total) * 100)),
				);
				updateAttributes({ width: `${percent}%` });
			};
			const onUp = () => {
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onUp);
				editor.commands.focus();
			};
			document.addEventListener("mousemove", onMove);
			document.addEventListener("mouseup", onUp);
		},
		[editor.commands, updateAttributes],
	);

	useEffect(() => {
		if (!editor) return;

		editor.on("selectionUpdate", updateSelection);
		editor.on("update", updateSelection);

		return () => {
			editor?.off("selectionUpdate", updateSelection);
			editor?.off("update", updateSelection);
		};
	}, [editor, updateSelection]);

	return (
		<NodeViewWrapper>
			<div className={wrapperClassName} data-drag-handle>
				<div
					contentEditable={false}
					ref={(el) => {
						imageWrapperRef.current = el;
						imageContainerRef.current = el as HTMLDivElement;
					}}
					className={imageClassName}
					style={{ width }}
				>
					<img
						className="block  w-full h-fit cursor-pointer transition-opacity"
						src={src}
						alt={alt || ""}
						onClick={onClick}
						loading="lazy"
						decoding="async"
					/>

					{selectedNode?.isBlock && (
						<>
							<div
								className="absolute top-1/2 -translate-y-1/2 -left-3 h-1/5 w-1 bg-gray-300 rounded-2xl cursor-ew-resize "
								onMouseDown={startResize("left")}
							/>
							<div
								className="absolute top-1/2 -translate-y-1/2 -right-3 h-1/5 w-1 bg-gray-300 rounded-2xl cursor-ew-resize "
								onMouseDown={startResize("right")}
							/>
							<div className="absolute -top-2 -translate-y-full translate-x-1/2 right-1/2 flex items-center justify-center">
								<ImgAlign editor={editor} />
							</div>
						</>
					)}
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export default ImageBlockView;
