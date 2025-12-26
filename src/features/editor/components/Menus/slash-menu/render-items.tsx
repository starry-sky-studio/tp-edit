import {
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift
} from "@floating-ui/dom";
import { type Editor, ReactRenderer } from "@tiptap/react";
import { CommandList } from "./command-list";

interface CommandListRef {
	onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * renderItems - Creates and manages the slash command menu popup
 * This function handles the lifecycle of the command suggestion menu that appears
 * when a user types '/' in the editor
 *
 * @returns An object containing lifecycle methods for the suggestion menu
 */
const renderItems = () => {
	// Store references to the rendered component and floating element
	let component: ReactRenderer | null = null;
	let cleanup: (() => void) | null = null;
	let floatingElement: HTMLElement | null = null;

	const updatePosition = async (
		reference: { getBoundingClientRect: () => DOMRect },
		floating: HTMLElement
	) => {
		const { x, y } = await computePosition(reference as any, floating, {
			placement: "bottom-start",
			middleware: [
				offset(6), // Add some space between the reference and floating element
				flip(), // Flip the element if there's not enough space
				shift() // Shift the element if there's not enough space
			]
		});

		Object.assign(floating.style, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	return {
		/**
		 * onStart - Initializes the command menu when slash command is triggered
		 * @param props.clientRect - The position where the menu should be rendered
		 * @param props.editor - The TipTap editor instance
		 */
		onStart: (props: { clientRect: () => DOMRect; editor: Editor }) => {
			// Create a new instance of the command list component
			component = new ReactRenderer(CommandList, {
				props,
				editor: props.editor
			});

			if (!props.clientRect || !component.element) {
				return;
			}

			// Create a virtual element for the reference
			const virtualReference = {
				getBoundingClientRect: props.clientRect
			};

			floatingElement = component.element as HTMLElement;
			floatingElement.style.position = "fixed";
			floatingElement.style.top = "0";
			floatingElement.style.left = "0";
			document.body.appendChild(floatingElement);
			// Setup floating-ui positioning
			cleanup = autoUpdate(virtualReference as any, floatingElement, () => {
				updatePosition(virtualReference, floatingElement as HTMLElement);
			});
		},

		/**
		 * onUpdate - Updates the command menu position and content
		 * Called when the user types or the editor content changes
		 * @param props.clientRect - The new position for the menu
		 * @param props.editor - The TipTap editor instance
		 */
		onUpdate: (props: { clientRect: () => DOMRect; editor: Editor }) => {
			component?.updateProps(props);
		},

		/**
		 * onKeyDown - Handles keyboard interactions with the command menu
		 * @param props.event - The keyboard event
		 * @returns boolean - Whether the event was handled
		 */
		onKeyDown: (props: { event: KeyboardEvent }) => {
			// Close the popup when Escape is pressed
			if (props.event.key === "Escape") {
				if (floatingElement) {
					floatingElement.style.display = "none";
				}
				return true;
			}

			const ref = component?.ref as CommandListRef;
			return ref?.onKeyDown?.(props) ?? false;
		},

		/**
		 * onExit - Cleanup method called when the command menu is being closed
		 * Destroys both the floating element and the rendered component
		 */
		onExit: () => {
			cleanup?.();
			floatingElement?.remove();
			component?.destroy();
		}
	};
};

export default renderItems;
