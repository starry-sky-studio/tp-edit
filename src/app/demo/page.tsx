import Link from "next/link";

/**
 * 演示页面入口
 * 展示 template.tsx 的用法和效果
 */
export default function DemoPage() {
	return (
		<div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-100">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">Template.tsx 演示</h1>
				<p className="text-gray-600 mb-8">
					这个演示展示了 Next.js 中{" "}
					<code className="bg-gray-200 px-2 py-1 rounded">template.tsx</code>{" "}
					的用法和效果
				</p>

				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">核心区别</h2>
					<div className="space-y-4">
						<div>
							<h3 className="font-medium text-blue-600">Layout.tsx</h3>
							<p className="text-sm text-gray-600">
								• 跨路由持久化
								<br />• 状态不会重置
								<br />• 适合：导航栏、全局状态、Provider
							</p>
						</div>
						<div>
							<h3 className="font-medium text-green-600">Template.tsx</h3>
							<p className="text-sm text-gray-600">
								• 每次导航都重新创建
								<br />• 状态会重置
								<br />• 适合：页面动画、重置表单、重新执行 useEffect
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">演示页面</h2>
					<div className="space-y-3">
						<Link
							href="/demo/counter"
							className="block px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						>
							📊 计数器演示 - 展示状态重置
						</Link>
						<Link
							href="/demo/input"
							className="block px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
						>
							📝 输入框演示 - 展示表单重置
						</Link>
						<Link
							href="/demo/server-component"
							className="block px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
						>
							🖥️ Server Component 演示 - 证明 children 保持类型
						</Link>
					</div>
				</div>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-blue-800">
						💡 <strong>提示：</strong>
						<br />
						打开浏览器控制台，观察每次导航时的日志输出
						<br />
						你会看到 "Template mounted" 和 "Template unmounted" 的日志
					</p>
				</div>
			</div>
		</div>
	);
}
