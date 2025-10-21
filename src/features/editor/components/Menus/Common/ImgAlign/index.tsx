import type { Editor } from "@tiptap/react";
import clsx from "clsx";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";

const ImgAlign = ({
	editor,
	className,
}: {
	editor: Editor | null;
	className?: string;
}) => {
	const items = useMemo(
		() => [
			{
				name: "left",
				isActive: () =>
					editor?.isActive("imageBlock", { align: "left" }) ?? false,
				icon: AlignLeft,
				title: "左对齐",
			},
			{
				name: "center",
				isActive: () =>
					editor?.isActive("imageBlock", { align: "center" }) ?? false,
				icon: AlignCenter,
				title: "居中对齐",
			},
			{
				name: "right",
				isActive: () =>
					editor?.isActive("imageBlock", { align: "right" }) ?? false,
				icon: AlignRight,
				title: "右对齐",
			},
		],
		[editor],
	);

	const handleImgAlign = useCallback(
		(value: "right" | "left" | "center") => {
			editor?.chain().setImageBlockAlign(value).focus().run();
		},
		[editor],
	);

	if (!editor || !editor.isEditable) return null;

	return (
		<div className={clsx("flex gap-1", className)}>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<Button
						key={item.name}
						variant={item.isActive() ? "secondary" : "ghost"}
						size="sm"
						onClick={() => handleImgAlign(item.name as any)}
						title={item.title}
					>
						<Icon className="size-4" />
					</Button>
				);
			})}
		</div>
	);
};

export default ImgAlign;
