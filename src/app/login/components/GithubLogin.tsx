"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GithubLogin() {
	return (
		<Button
			type="button"
			variant="outline"
			className="w-full justify-center border-slate-200 text-slate-700 hover:bg-slate-50"
			onClick={() => {
				toast.info("GitHub 登录暂未接入，后续会支持第三方账号登录。");
			}}
		>
			使用 GitHub 登录
		</Button>
	);
}
