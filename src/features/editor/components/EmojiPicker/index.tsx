import data from "@emoji-mart/data";
import zh from "@emoji-mart/data/i18n/zh.json";
import Picker from "@emoji-mart/react";

interface EmojiPickerProps {
	onEmojiSelect: (emoji: any) => void;
}

const EmojiPicker = (props: EmojiPickerProps) => {
	const { onEmojiSelect } = props;

	return (
		<Picker
			data={data}
			onEmojiSelect={onEmojiSelect}
			theme="light"
			previewPosition="none"
			skinTonePosition="none"
			i18n={zh}
		/>
	);
};

export default EmojiPicker;
