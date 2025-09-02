import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { CommandItem } from "./menu-items";

interface CommandListProps {
	items: CommandItem[];
	command: (item: CommandItem) => void;
}

export interface CommandListRef {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
	(props, ref) => {
		const { items, command } = props;

		const [selectedIndex, setSelectedIndex] = useState(0);
		const commandListRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			onKeyDown: ({ event }) => {
				const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
				if (!navigationKeys.includes(event.key)) {
					return false;
				}

				event.preventDefault();

				switch (event.key) {
					case "ArrowUp":
						setSelectedIndex((selectedIndex + items.length - 1) % items.length);
						break;
					case "ArrowDown":
						setSelectedIndex((selectedIndex + 1) % items.length);
						break;
					case "Enter":
						command(items[selectedIndex]);
						return true;
					default:
						return false;
				}
				return true;
			},
		}));

		useEffect(() => {
			const commandList = commandListRef.current;
			const selectedItem = commandList?.children[selectedIndex] as HTMLElement;

			if (selectedItem && commandList) {
				const scrollTop = commandList.scrollTop;
				const scrollBottom = scrollTop + commandList.offsetHeight;
				const itemTop = selectedItem.offsetTop;
				const itemBottom = itemTop + selectedItem.offsetHeight;

				if (itemTop < scrollTop) {
					commandList.scrollTop = itemTop;
				} else if (itemBottom > scrollBottom) {
					commandList.scrollTop = itemBottom - commandList.offsetHeight;
				}
			}
		}, [selectedIndex]);

		return (
			<div
				ref={commandListRef}
				className="z-50 h-auto max-h-[330px] w-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur-lg ring-1 ring-black/5 animate-[zoom_0.2s_ease-out]"
			>
				{items.map((item, index) => {
					const isSelected = index === selectedIndex;
					const Icon = item.icon;

					return (
						<button
							key={index}
							onClick={() => command(item)}
							className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
								isSelected
									? "bg-gray-100/80 text-gray-900 shadow-sm"
									: "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
							}`}
						>
							<div
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
									isSelected
										? "bg-white shadow-sm ring-1 ring-black/5"
										: "bg-gray-50/50"
								}`}
							>
								<Icon className="h-5 w-5" />
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="truncate text-[15px] font-medium leading-none">
									{item.title}
								</p>
								<p className="mt-1 truncate text-xs text-gray-500/90">
									{item.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		);
	},
);
