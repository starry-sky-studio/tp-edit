"use client";

import authApi from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthStorage } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AuthShell } from "./components/AuthShell";
import { GithubLogin } from "./components/GithubLogin";
import { GoogleLogin } from "./components/GoogleLogin";

const formSchema = z.object({
	email: z
		.string()
		.email("请输入正确的邮箱地址")
		.min(3, "邮箱至少需要 3 个字符")
		.max(64, "邮箱最多 64 个字符"),
	password: z.string().min(6, "密码至少需要 6 位").max(64, "密码最多 64 位")
});

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			const res = await authApi.login(
				{
					email: data.email,
					password: data.password
				}
				// 这里的错误统一交给 onError 处理，不在请求里单独 toast
			);
			console.log(res, res.data);
			const result = res.data;
			if (!result) {
				throw new Error(res.error || "登录失败");
			}
			return result;
		},
		onSuccess: (result, variables) => {
			const token = (result as any)?.token;
			const refresh_token = (result as any).refresh_token;
			if (token && refresh_token) {
				AuthStorage.setAuthTokens(token, refresh_token);
				router.push("/");
				toast.success("登录成功", {
					description: `欢迎回来，${variables.email}`
				});
			} else {
				toast.error("登录失败", {
					description: "登录失败"
				});
			}
		},
		onError: (error: unknown) => {
			console.log(error, "error");
			const errorMsg = error instanceof Error ? error.message : "发生未知错误";
			toast.error("登录失败", {
				description: errorMsg
			});
		}
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutation.mutate(data);
	}

	return (
		<AuthShell title="欢迎回来">
			{/* 账号密码登录表单 */}
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FieldGroup className="gap-4">
					<Controller
						name="email"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<Input
									{...field}
									aria-invalid={fieldState.invalid}
									placeholder="邮箱"
									autoComplete="off"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Controller
						name="password"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<div className="relative">
									<Input
										{...field}
										type={showPassword ? "text" : "password"}
										aria-invalid={fieldState.invalid}
										placeholder="密码"
										autoComplete="off"
										className="pr-10"
									/>
									<button
										type="button"
										className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center"
										onClick={() => setShowPassword((v) => !v)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>
				<div className="mt-4">
					<Button
						type="submit"
						className="w-full"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								登录中...
							</>
						) : (
							"登录"
						)}
					</Button>
				</div>
			</form>

			{/* 注册链接 */}
			<div className="mt-2 text-center text-sm text-slate-600">
				还没有账号？
				<Link
					href="/signup"
					className="text-primary hover:underline font-medium"
				>
					立即注册
				</Link>
			</div>

			{/* 分割线 */}
			<div className="my-4 flex items-center justify-center">
				<span className="h-px w-full bg-slate-200" />
				<span className="mx-3 text-xs text-slate-400">或</span>
				<span className="h-px w-full bg-slate-200" />
			</div>

			{/* 第三方登录按钮 */}
			<div className="space-y-3">
				<GithubLogin />
				<GoogleLogin />
			</div>
		</AuthShell>
	);
}
