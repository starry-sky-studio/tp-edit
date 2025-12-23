"use client";

import { type ReactNode, useEffect, useState } from "react";

/**
 * Template 组件示例
 *
 * 与 layout.tsx 的区别：
 * - layout.tsx: 跨路由持久化，状态不会重置（适合全局状态、导航栏等）
 * - template.tsx: 每次导航都会重新创建，状态会重置（适合页面动画、重置表单等）
 *
 * 使用场景：
 * 1. 页面切换动画效果
 * 2. 导航时重置组件状态（如输入框、计数器）
 * 3. 每次导航都重新执行 useEffect
 *
 * ⚠️ 重要：关于 "use client" 边界
 * - "use client" 只影响**直接导入**的组件，不影响通过 children prop 传递的组件
 * - 通过 {children} 传递的页面组件（如 page.tsx）仍然可以是 Server Component
 * - 只有当你直接 import 并在客户端组件中使用时，才会变成客户端组件
 *
 * 示例：
 * ✅ Server Component (page.tsx) -> 通过 children 传递 -> 仍然是 Server Component
 * ❌ Server Component -> 直接 import 到 Client Component -> 变成 Client Component
 */

export default function Template({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// 每次导航都会执行这个 effect
		console.log("Template mounted - 页面切换了！");
		setMounted(true);

		// 可以在这里添加页面切换动画
		return () => {
			console.log("Template unmounted - 页面即将切换");
		};
	}, []);

	return (
		<div
			className={`transition-opacity duration-300 ${
				mounted ? "opacity-100" : "opacity-0"
			}`}
		>
			{children}
		</div>
	);
}
