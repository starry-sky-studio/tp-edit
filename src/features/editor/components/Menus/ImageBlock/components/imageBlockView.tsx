import type { Node } from "@tiptap/pm/model";
import {
	type Editor,
	NodeViewWrapper,
	type ReactNodeViewProps,
} from "@tiptap/react";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import Moveable from "react-moveable";

interface ImageBlockViewProps extends ReactNodeViewProps {
	editor: Editor;
	getPos: () => number | undefined;
	node: Node;
	updateAttributes: (attrs: Record<string, any>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
	const { editor, getPos, node, updateAttributes } = props;
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const { src, width, height, align, alt } = node.attrs;
	const [isSelected, setIsSelected] = useState(false);

	// 创建 ref 来获取目标元素
	const targetRef = useRef<HTMLImageElement>(null);
	const [target, setTarget] = useState<HTMLElement | null>(null);

	// 初始化状态来存储元素的位置、尺寸、缩放等
	const [frame, setFrame] = useState({
		translate: [0, 0],
		scale: [1, 1],
		width: width || 300,
		height: height || 200,
	});

	// 检查当前节点是否被选中
	useEffect(() => {
		const updateSelection = () => {
			const pos = getPos();
			if (pos !== undefined) {
				const { from, to } = editor.state.selection;
				const isNodeSelected = from <= pos && to >= pos + node.nodeSize;
				setIsSelected(isNodeSelected);
			}
		};

		// 监听选择变化
		editor.on("selectionUpdate", updateSelection);
		updateSelection(); // 初始检查

		return () => {
			editor.off("selectionUpdate", updateSelection);
		};
	}, [editor, getPos, node.nodeSize]);

	// 初始化目标元素
	useEffect(() => {
		if (targetRef.current) {
			setTarget(targetRef.current);
		}
	}, []);

	// 当节点属性变化时更新frame状态
	useEffect(() => {
		setFrame({
			translate: [0, 0],
			scale: [1, 1],
			width: width || 300,
			height: height || 200,
		});
	}, [width, height]);

	const wrapperClassName = clsx(
		"my-4",
		align === "left" && "ml-0 mr-auto flex justify-start",
		align === "right" && "ml-auto mr-0 flex justify-end",
		align === "center" && "mx-auto flex justify-center",
		"items-center",
	);

	const imageClassName = clsx(
		"block cursor-pointer transition-all duration-200",
		isSelected && "ring-2 ring-blue-500 ring-offset-2",
	);

	const onClick = useCallback(() => {
		const pos = getPos();
		if (pos !== undefined) {
			editor.commands.setNodeSelection(pos);
		}
	}, [getPos, editor.commands]);

	return (
		<NodeViewWrapper>
			<div
				className={wrapperClassName}
				style={{ width: frame.width }}
				data-drag-handle
			>
				<div
					contentEditable={false}
					ref={imageWrapperRef}
					className="relative inline-block"
				>
					<img
						ref={targetRef}
						className={imageClassName}
						src={src}
						alt={alt || ""}
						onClick={onClick}
						loading="lazy"
						decoding="async"
						style={{
							width: `${frame.width}px`,
							height: `${frame.height}px`,
							objectFit: "contain",
						}}
					/>
					{isSelected && target && (
						<Moveable
							target={target}
							draggable={true}
							resizable={true}
							scalable={true}
							rotatable={false}
							keepRatio={false}
							throttleDrag={0}
							edge={false}
							origin={false}
							// 拖拽事件
							onDragStart={({ set }) => {
								set(frame.translate);
							}}
							onDrag={({ beforeTranslate }) => {
								setFrame((prev) => ({
									...prev,
									translate: beforeTranslate,
								}));
							}}
							onDragEnd={() => {
								// 拖拽结束后重置位置
								setFrame((prev) => ({
									...prev,
									translate: [0, 0],
								}));
							}}
							// 调整大小事件
							onResizeStart={({ setOrigin, dragStart }) => {
								setOrigin(["%", "%"]);
								if (dragStart) {
									dragStart.set(frame.translate);
								}
							}}
							onResize={({ width, height, drag }) => {
								const beforeTranslate = drag.beforeTranslate;
								setFrame((prev) => ({
									...prev,
									width,
									height,
									translate: beforeTranslate,
								}));
							}}
							onResizeEnd={() => {
								// 调整大小结束后更新节点属性
								updateAttributes({
									width: frame.width,
									height: frame.height,
								});
								// 重置位置
								setFrame((prev) => ({
									...prev,
									translate: [0, 0],
								}));
							}}
							// 缩放事件
							onScaleStart={({ set }) => {
								set(frame.scale);
							}}
							onScale={({ scale, drag }) => {
								const beforeTranslate = drag.beforeTranslate;
								// 计算新的宽度和高度
								const newWidth = frame.width * scale[0];
								const newHeight = frame.height * scale[1];
								setFrame((prev) => ({
									...prev,
									scale,
									width: newWidth,
									height: newHeight,
									translate: beforeTranslate,
								}));
							}}
							onScaleEnd={() => {
								// 缩放结束后更新节点属性并重置scale
								updateAttributes({
									width: frame.width,
									height: frame.height,
								});
								setFrame((prev) => ({
									...prev,
									scale: [1, 1],
									translate: [0, 0],
								}));
							}}
						/>
					)}
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export default ImageBlockView;
