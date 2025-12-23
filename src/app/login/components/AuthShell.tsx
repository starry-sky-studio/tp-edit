import type { ReactNode } from "react";

interface AuthShellProps {
	title: string;
	children: ReactNode;
}

export function AuthShell({ title, children }: AuthShellProps) {
	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* 左侧：产品介绍（仅在中等及以上屏幕显示） */}
			<div className="relative hidden w-1/2 flex-col overflow-hidden bg-gradient-to-br from-sky-200 via-indigo-200 to-slate-200 p-10 text-slate-800 md:flex">
				{/* 渐变光斑装饰 */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
					<div className="absolute top-6 -right-12 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
					<div className="absolute bottom-4 left-1/3 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />
				</div>

				<div className="relative flex flex-1 items-center justify-center">
					<div className="max-w-md text-center">
						<h2 className="text-3xl font-semibold tracking-tight text-slate-900 drop-shadow-sm">
							TP Edit
						</h2>
						<p className="mt-4 text-sm leading-relaxed text-slate-700">
							实时保存 · 多端同步 · AI 助写
							<br />
							Markdown / 富文本 / 快捷键，专注创作体验。
						</p>
					</div>
				</div>

				<p className="relative mt-auto text-xs text-slate-600">
					© {new Date().getFullYear()} TP Edit · Write with peace of mind.
				</p>
			</div>

			{/* 右侧：登录 / 注册卡片（始终显示） */}
			<div className="flex flex-1 items-center justify-center p-6">
				<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-slate-200">
					<h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
						{title}
					</h2>

					{children}
				</div>
			</div>
		</div>
	);
}
