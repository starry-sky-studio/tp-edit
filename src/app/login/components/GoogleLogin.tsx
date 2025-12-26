"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function GoogleLogin() {
	const [loading, setLoading] = useState(false);

	const handleGoogleLogin = () => {
		const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			toast.error("缺少 Google OAuth 配置，请检查环境变量");
			return;
		}

		setLoading(true);

		// 生成 state 防止 CSRF
		const state =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `${Date.now()}`;

		// 要求 email、基础 profile 信息
		const scope = ["openid", "email", "profile"].join(" ");

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: "code",
			scope,
			state,
			access_type: "online",
			include_granted_scopes: "true",
			prompt: "consent"
		});

		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	};

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full justify-center border-slate-200 text-slate-700 hover:bg-slate-50"
			disabled={loading}
			onClick={handleGoogleLogin}
		>
			{loading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					正在跳转 Google...
				</>
			) : (
				"使用 Google 登录"
			)}
		</Button>
	);
}
