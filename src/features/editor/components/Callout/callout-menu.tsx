import { autoUpdate, computePosition, flip, shift } from "@floating-ui/dom";
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ColorPicker from "../ColorPicker";

interface CalloutMenuProps {
	editor: Editor;
}

const CalloutMenu = (props: CalloutMenuProps) => {
	const { editor } = props;
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [hoveredCalloutElement, setHoveredCalloutElement] =
		useState<HTMLElement | null>(null);
	const [currentCalloutNode, setCurrentCalloutNode] = useState<any>(null);
	const [currentCalloutPos, setCurrentCalloutPos] = useState<number | null>(
		null,
	);
	const menuRef = useRef<HTMLDivElement>(null);
	const cleanupRef = useRef<(() => void) | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const updatePosition = useCallback(async () => {
		if (!hoveredCalloutElement || !menuRef.current) return;

		const virtualReference = {
			getBoundingClientRect: () =>
				hoveredCalloutElement.getBoundingClientRect(),
		};

		const { x, y } = await computePosition(
			virtualReference as any,
			menuRef.current,
			{
				placement: "top",
				middleware: [flip(), shift({ padding: 8 })],
			},
		);

		setPosition({ x, y });
	}, [hoveredCalloutElement]);

	const updateCalloutBackground = useCallback(
		(color: string) => {
			if (currentCalloutPos == null) return;

			const { state, view } = editor;
			const nodeAtPos = state.doc.nodeAt(currentCalloutPos);
			const calloutType = state.schema.nodes.callout;
			if (!nodeAtPos || nodeAtPos.type !== calloutType) return;

			const tr = state.tr.setNodeMarkup(currentCalloutPos, calloutType, {
				...nodeAtPos.attrs,
				backgroundColor: color,
			});
			view.dispatch(tr);
		},
		[editor, currentCalloutPos],
	);

	const handleBackgroundColorChange = useCallback(
		(color: string) => {
			updateCalloutBackground(color);
		},
		[updateCalloutBackground],
	);

	const handleResetColors = useCallback(() => {
		updateCalloutBackground("#fff7ed");
	}, [updateCalloutBackground]);

	const handleMouseOver = useCallback(
		(event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const calloutElement = target.closest(".callout-node") as HTMLElement;

			if (calloutElement) {
				setHoveredCalloutElement(calloutElement);
				clearTimeout(timeoutRef.current as NodeJS.Timeout);
				timeoutRef.current = null;
				setIsVisible(true);

				// 获取当前 callout 节点与其在文档中的位置
				const pos = editor.view.posAtDOM(calloutElement, 0);
				const resolvedPos = editor.view.state.doc.resolve(pos);
				const calloutNode = resolvedPos.parent;
				const nodePos = resolvedPos.before();
				setCurrentCalloutNode(calloutNode);
				setCurrentCalloutPos(nodePos);
			}
		},
		[editor],
	);

	const handleMouseOut = useCallback((event: MouseEvent) => {
		const target = event.target as HTMLElement;
		const calloutElement = target.closest(".callout-node");
		const menuElement = menuRef.current;

		// 检查鼠标是否真的离开了 callout 元素和菜单
		if (
			calloutElement &&
			!calloutElement.contains(event.relatedTarget as Node) &&
			!menuElement?.contains(event.relatedTarget as Node)
		) {
			timeoutRef.current = setTimeout(() => {
				setIsVisible(false);
				setHoveredCalloutElement(null);
				setCurrentCalloutNode(null);
				setCurrentCalloutPos(null);
			}, 150);
		}
	}, []);

	useEffect(() => {
		if (!editor) return;

		const editorElement = editor.view.dom;

		const handleTransaction = () => {
			// 如果当前有 hoveredCalloutElement，但它已经不在 DOM 中，说明被删除
			if (
				hoveredCalloutElement &&
				!document.body.contains(hoveredCalloutElement)
			) {
				setIsVisible(false);
				setHoveredCalloutElement(null);
				setCurrentCalloutNode(null);
				setCurrentCalloutPos(null);
			}
		};

		editorElement.addEventListener("mouseover", handleMouseOver);
		editorElement.addEventListener("mouseout", handleMouseOut);
		editor.on("transaction", handleTransaction);

		return () => {
			editorElement.removeEventListener("mouseover", handleMouseOver);
			editorElement.removeEventListener("mouseout", handleMouseOut);
			editor.off("transaction", handleTransaction);
		};
	}, [editor, handleMouseOver, handleMouseOut, hoveredCalloutElement]);

	useEffect(() => {
		if (isVisible && menuRef.current && hoveredCalloutElement) {
			const virtualReference = {
				getBoundingClientRect: () =>
					hoveredCalloutElement.getBoundingClientRect(),
			};

			cleanupRef.current = autoUpdate(
				virtualReference as any,
				menuRef.current,
				updatePosition,
			);
		}

		return () => {
			cleanupRef.current?.();
		};
	}, [isVisible, hoveredCalloutElement, updatePosition]);

	if (!isVisible) return null;

	return (
		<div
			ref={menuRef}
			className="fixed z-50 flex items-center rounded-lg bg-transparent p-2"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
			}}
		>
			{
				// TODO：后续调整一下背景色
			}
			<div className="flex items-center rounded-lg bg-background p-1">
				<ColorPicker
					onBackgroundColorChange={handleBackgroundColorChange}
					onReset={handleResetColors}
					defaultBackgroundColor={
						currentCalloutNode?.attrs?.backgroundColor || "#fff7ed"
					}
					showBackgroundColor={true}
					showTextColor={false}
					showBorderColor={false}
				/>
			</div>
		</div>
	);
};

export default CalloutMenu;
