import type { Node } from "@tiptap/pm/model";
import {
	type Editor,
	NodeViewWrapper,
	type ReactNodeViewProps,
} from "@tiptap/react";
import clsx from "clsx";
import { useCallback, useRef } from "react";

// import { ImageBlockMenu } from './ImageBlockMenu';

interface ImageBlockViewProps extends ReactNodeViewProps {
	editor: Editor;
	getPos: () => number | undefined;
	node: Node;
	updateAttributes: (attrs: Record<string, any>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
	const { editor, getPos, node } = props;
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const { src, width, align, alt } = node.attrs;

	const wrapperClassName = clsx(
		align === "left" ? "ml-0 flex justify-start items-center" : "ml-auto",
		align === "right" ? "mr-0 flex justify-end items-center" : "mr-auto",
		align === "center" && "mx-auto  flex justify-center items-center",
	);

	const onClick = useCallback(() => {
		const pos = getPos();

		if (pos !== undefined) {
			editor.commands.setNodeSelection(pos);
		}
	}, [getPos, editor.commands]);

	return (
		<NodeViewWrapper>
			<div className={wrapperClassName} style={{ width }} data-drag-handle>
				<div contentEditable={false} ref={imageWrapperRef} className="border ">
					<img
						className="block cursor-pointer hover:opacity-90 transition-opacity"
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
