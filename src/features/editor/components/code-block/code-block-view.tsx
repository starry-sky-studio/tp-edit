import {
	NodeViewContent,
	NodeViewWrapper,
	type ReactNodeViewProps,
} from "@tiptap/react";
import { Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const CodeBlockView = (props: ReactNodeViewProps) => {
	const { node, updateAttributes, extension, editor } = props;
	const { language } = node.attrs;
	const options = extension.options.lowlight.listLanguages().sort();

	const [languageValue, setLanguageValue] = useState<string>(language || "");

	const handleLanguageChange = useCallback(
		(language: string) => {
			setLanguageValue(language);
			updateAttributes({
				language,
			});
		},
		[updateAttributes],
	);

	const handleCopy = useCallback(() => {
		console.log("copy codeBlock content");
	}, []);

	return (
		<NodeViewWrapper className="codeBlock p-1 rounded bg-gray-50">
			<div className="flex justify-end">
				<Select value={languageValue} onValueChange={handleLanguageChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Language" />
					</SelectTrigger>
					<SelectContent>
						{options.map((option: string) => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button variant="ghost" size="icon" onClick={handleCopy}>
					<Copy />
				</Button>
			</div>
			<pre spellCheck="false" className="not-prose py-2.5 px-4 rounded m1">
				<NodeViewContent className={`language-${language}`} />
			</pre>
		</NodeViewWrapper>
	);
};

export default CodeBlockView;
