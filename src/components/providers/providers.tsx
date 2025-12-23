"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";

/**
 * 组合所有 Provider 的入口
 *
 * 注意：QueryClient 必须在 Client Component 中创建
 * 不能在 Server Component 中创建类实例并传递给 Client Component
 */
export function Providers({ children }: { children: ReactNode }) {
	// 在 Client Component 中创建 QueryClient 实例
	// 使用 useState 确保在客户端只创建一次
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 分钟
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
