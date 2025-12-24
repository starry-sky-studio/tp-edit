"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GithubLogin() {
	const [loading, setLoading] = useState(false);

	const handleGithubLogin = async () => {
		const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
		const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			toast.error("缺少 GitHub OAuth 配置，请检查环境变量");
			return;
		}

		setLoading(true);

		// 生成 state 防止 CSRF；这里用浏览器原生 crypto
		const state =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `${Date.now()}`;

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: "read:user user:email",
			state
		});

		// 跳转到 GitHub 授权页
		window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
	};

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full justify-center border-slate-200 text-slate-700 hover:bg-slate-50"
			disabled={loading}
			onClick={handleGithubLogin}
		>
			{loading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					正在登录...
				</>
			) : (
				"使用 GitHub 登录"
			)}
		</Button>
	);
}
