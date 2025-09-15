import { zodResolver } from "@hookform/resolvers/zod";
import { type Editor, useEditorState } from "@tiptap/react";
import { useCallback, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImgIcon } from "@/styles/svg/index";
import { ImageBlockWidth } from "../../ImageBlock/components/ImageBlockWidth";

const formSchema = z.object({
	url: z.string().url("请输入有效的URL"),
});

type FormData = z.infer<typeof formSchema>;

const ImgCommand = ({ editor }: { editor: Editor | null }) => {
	const fileInputId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: "",
		},
	});

	const onSubmit = (data: FormData) => {
		if (editor && data.url) {
			editor.chain().setImageBlock({ src: data.url }).focus().run();
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && editor) {
			// 检查文件类型
			if (!file.type.startsWith("image/")) {
				alert("请选择图片文件");
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				alert("图片文件大小不能超过 5MB");
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (result) {
					editor.chain().setImageBlock({ src: result }).focus().run();
				}
			};
			reader.readAsDataURL(file);

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const onWidthChange = useCallback(
		(value: number) => {
			if (!editor) return;
			editor
				.chain()
				.focus(undefined, { scrollIntoView: false })
				.setImageBlockWidth(value)
				.run();
		},
		[editor],
	);

	const {
		isImageCenter,
		isImageLeft,
		isImageRight,
		width = 100,
	} = useEditorState({
		editor,
		selector: (ctx: { editor: typeof editor }) => {
			if (!ctx.editor)
				return {
					isImageLeft: false,
					isImageCenter: false,
					isImageRight: false,
					width: 0,
				};
			return {
				isImageLeft: ctx.editor.isActive("imageBlock", { align: "left" }),
				isImageCenter: ctx.editor.isActive("imageBlock", { align: "center" }),
				isImageRight: ctx.editor.isActive("imageBlock", { align: "right" }),
				width: parseInt(ctx.editor.getAttributes("imageBlock")?.width || "0"),
			};
		},
	}) ?? {};
	return (
		<div className="flex flex gap-2">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="border-none border-0 cursor-pointer"
					>
						<ImgIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-100">
					<Tabs defaultValue="upload">
						<TabsList>
							<TabsTrigger value="upload">Upload</TabsTrigger>
							<TabsTrigger value="embedLink">Embed Link</TabsTrigger>
						</TabsList>
						<TabsContent value="upload">
							<div className="p-2">
								<Input
									id={fileInputId}
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileUpload}
									className="cursor-pointer"
								/>
								<p className="text-sm text-muted-foreground mt-2">
									支持 JPG、PNG、GIF 等格式，文件大小不超过 5MB
								</p>
							</div>
						</TabsContent>
						<TabsContent value="embedLink">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-2 p-2"
								>
									<FormField
										control={form.control}
										name="url"
										render={({ field }) => (
											<FormItem>
												<FormLabel>图片链接</FormLabel>
												<FormControl>
													<Input placeholder="请输入图片URL" {...field} />
												</FormControl>
												<FormDescription>
													请输入有效的图片链接地址
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type="submit" className="w-full">
										插入图片
									</Button>
								</form>
							</Form>
						</TabsContent>
					</Tabs>
				</DropdownMenuContent>
			</DropdownMenu>
			<div
				onClick={() => {
					console.log("center");
					editor?.chain().setImageBlockAlign("center").focus().run();
				}}
			>
				center
			</div>
			<div
				onClick={() => editor?.chain().setImageBlockAlign("left").focus().run()}
			>
				left
			</div>
			<div
				onClick={() =>
					editor?.chain().setImageBlockAlign("right").focus().run()
				}
			>
				right
			</div>
			<ImageBlockWidth onChange={onWidthChange} value={width} />
		</div>
	);
};

export default ImgCommand;
