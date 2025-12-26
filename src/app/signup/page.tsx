"use client";

import authApi from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthStorage } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AuthShell } from "../login/components/AuthShell";

const formSchema = z
	.object({
		email: z
			.string()
			.email("请输入正确的邮箱地址")
			.min(3, "邮箱至少需要 3 个字符")
			.max(64, "邮箱最多 64 个字符"),
		name: z
			.string()
			.min(1, "昵称不能为空")
			.max(32, "昵称最多 32 个字符")
			.optional(),
		password: z.string().min(6, "密码至少需要 6 位").max(64, "密码最多 64 位"),
		confirmPassword: z
			.string()
			.min(6, "确认密码至少需要 6 位")
			.max(64, "确认密码最多 64 位"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "两次输入的密码不一致",
	});

export default function SignupPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			confirmPassword: "",
		},
	});

	//使用tanstack-query的useMutation
	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			const res = await authApi.signup({
				email: data.email,
				password: data.password,
				name: data.name || undefined,
			});

			const result = (res.data as any)?.data ?? res.data;

			if (!result) {
				throw new Error(res.error || "注册失败");
			}

			return result;
		},
		onSuccess: (result) => {
			if (result.token && result.refresh_token) {
				AuthStorage.setAuthTokens(result.token, result.refresh_token);
			}
			router.push("/");
			toast.success("注册成功", {
				description: `欢迎加入，${result.user?.email || result.user?.name || "用户"}`,
			});
		},
		onError: (error: unknown) => {
			const errorMsg = error instanceof Error ? error.message : "请稍后再试";
			toast.error(errorMsg, {
				description: "请稍后再试",
			});
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutation.mutate(data);
	}

	return (
		<AuthShell title="创建账号">
			{/* 注册表单 */}
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
						name="name"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<Input
									{...field}
									aria-invalid={fieldState.invalid}
									placeholder="昵称（可选）"
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
					<Controller
						name="confirmPassword"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<div className="relative">
									<Input
										{...field}
										type={showConfirmPassword ? "text" : "password"}
										aria-invalid={fieldState.invalid}
										placeholder="确认密码"
										autoComplete="off"
										className="pr-10"
									/>
									<button
										type="button"
										className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 flex items-center"
										onClick={() => setShowConfirmPassword((v) => !v)}
									>
										{showConfirmPassword ? (
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
								注册中...
							</>
						) : (
							"注册/登录"
						)}
					</Button>
				</div>
			</form>
		</AuthShell>
	);
}
