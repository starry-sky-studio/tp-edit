import type { Editor } from "@tiptap/react";
import { Braces } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
	editor: Editor | null;
}

const CodeBlock = (props: CodeBlockProps) => {
	const { editor } = props;

	const handleAddCodeBlock = useCallback(() => {
		if (!editor || !editor.isEditable) return;
		editor.commands.insertContentAt(editor.state.selection.to, {
			type: "codeBlock",
		});
	}, [editor]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleAddCodeBlock}
			title="Code Block"
		>
			<Braces />
		</Button>
	);
};

export default CodeBlock;
