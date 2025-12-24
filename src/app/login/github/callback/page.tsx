"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import authApi from "@/api/auth";
import AuthStorage from "@/utils/auth-storage";

export default function GithubCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const code = searchParams.get("code") ?? undefined;
		const state = searchParams.get("state") ?? undefined;

		if (!code) {
			toast.error("GitHub 登录失败：缺少 code");
			router.replace("/login");
			return;
		}

		const loginWithCode = async () => {
			try {
				const res = await authApi.githubCallback(code, state);
				const result: any = res.data?.data ?? res.data;

				if (result?.token && result?.refresh_token) {
					AuthStorage.setAuthTokens(result.token, result.refresh_token);
					toast.success("GitHub 登录成功");
					router.replace("/");
				} else {
					throw new Error(res.error || "GitHub 登录失败");
				}
			} catch (error) {
				const msg =
					error instanceof Error
						? error.message
						: "GitHub 登录失败，请稍后再试";
				toast.error(msg);
				router.replace("/login");
			} finally {
				setLoading(false);
			}
		};

		loginWithCode();
	}, [router, searchParams]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
			<div className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-6 py-5 text-base text-slate-700 shadow-md">
				<Loader2 className="h-5 w-5 animate-spin text-slate-500" />
				<span className="leading-relaxed">
					{loading ? "正在完成 GitHub 登录..." : "即将跳转"}
				</span>
			</div>
		</div>
	);
}
