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
		<div className="dropdown-menu">
			{props.items.map((item: EmojiItem, index: number) => (
				<button
					className={index === selectedIndex ? "is-selected" : ""}
					key={index}
					onClick={() => selectItem(index)}
				>
					{item.fallbackImage ? (
						<span
							style={{
								display: "inline-block",
								width: "1em",
								height: "1em",
								verticalAlign: "middle",
								backgroundImage: `url(${item.fallbackImage})`,
								backgroundSize: "contain",
								backgroundRepeat: "no-repeat",
								backgroundPosition: "center",
							}}
							aria-label={item.name}
							role="img"
						/>
					) : (
						item.emoji
					)}
					:{item.name}:
				</button>
			))}
		</div>
	);
});

// 设置组件显示名称（便于调试）
EmojiList.displayName = "EmojiList";

export default EmojiList;
