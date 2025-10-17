import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/react";
import { useId, useRef } from "react";
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImgIcon } from "@/styles/svg/index";

const formSchema = z.object({
	url: z.url("请输入有效的URL"),
});

type FormData = z.infer<typeof formSchema>;

const ImgUpload = ({ editor }: { editor: Editor | null }) => {
	const fileInputId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: "",
		},
	});

	// 基础扩展名校验（避免 HEAD/CORS 受限场景）
	const isImageUrlByExtension = (url: string) =>
		/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

	const onSubmit = async (data: FormData) => {
		const url = data.url?.trim();
		if (!url) return;

		if (!isImageUrlByExtension(url)) {
			form.setError("url", {
				type: "validate",
				message: "请输入图片直链（如 .png/.jpg/.webp 等）",
			});
			return;
		}

		if (editor) {
			editor.chain().setImageBlock({ src: url }).focus().run();
			form.reset();
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

	return (
		<div className="flex gap-2">
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
		</div>
	);
};

export default ImgUpload;
