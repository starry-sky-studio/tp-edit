import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";

interface EmojiItem {
	name: string;
	emoji: string;
	fallbackImage?: string;
}

interface EmojiListProps {
	items: EmojiItem[];
	command: (item: { name: string }) => void;
}

interface EmojiListRef {
	onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

const EmojiList = forwardRef<EmojiListRef, EmojiListProps>((props, ref) => {
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	const selectItem = useCallback(
		(index: number): void => {
			const item = props.items[index];

			if (item) {
				props.command({ name: item.name });
			}
		},
		[props.items, props.command],
	);

	const upHandler = useCallback((): void => {
		setSelectedIndex(
			(selectedIndex + props.items.length - 1) % props.items.length,
		);
	}, [selectedIndex, props.items.length]);

	const downHandler = useCallback((): void => {
		setSelectedIndex((selectedIndex + 1) % props.items.length);
	}, [selectedIndex, props.items.length]);

	const enterHandler = useCallback((): void => {
		selectItem(selectedIndex);
	}, [selectItem, selectedIndex]);

	useEffect(() => setSelectedIndex(0), []);

	useImperativeHandle(ref, () => {
		return {
			onKeyDown: (event: { event: KeyboardEvent }): boolean => {
				if (event.event.key === "ArrowUp") {
					upHandler();
					return true;
				}

				if (event.event.key === "ArrowDown") {
					downHandler();
					return true;
				}

				if (event.event.key === "Enter") {
					enterHandler();
					return true;
				}

				return false;
			},
		};
	}, [upHandler, downHandler, enterHandler]);

	return (
		<div className="z-50 h-auto max-h-[330px] w-fit overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur-lg ring-1 ring-black/5 animate-[zoom_0.2s_ease-out]">
			{props.items.map((item: EmojiItem, index: number) => (
				<div key={index}>
					<button
						key={index}
						onClick={() => selectItem(index)}
						className={`flex cursor-pointer w-full hover:bg-gray-50 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200`}
					>
						{item.emoji} : {item.name}
					</button>
				</div>
			))}
		</div>
	);
});

EmojiList.displayName = "EmojiList";

export default EmojiList;
