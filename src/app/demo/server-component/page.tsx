/**
 * 这个页面是 Server Component（没有 "use client"）
 *
 * 即使它被 template.tsx（Client Component）包裹，
 * 它仍然保持为 Server Component！
 *
 * 验证方法：
 * 1. 这个文件可以直接使用 async/await 获取数据
 * 2. 可以在服务器端执行代码
 * 3. 不会被打包到客户端 bundle
 */
export default async function ServerComponentPage() {
	// ✅ Server Component 可以直接使用 async/await
	// 这里模拟一个服务器端数据获取
	const serverTime = new Date().toISOString();

	return (
		<div className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-red-100">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">Server Component 演示</h1>

				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">
						✅ 这个页面是 Server Component
					</h2>
					<p className="text-gray-600 mb-4">
						即使被 template.tsx（Client Component）包裹，这个页面仍然是 Server
						Component！
					</p>

					<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-green-800">
							<strong>证明：</strong>
							<br />• 服务器端时间: <code>{serverTime}</code>
							<br />• 这个时间是在服务器端生成的，不是客户端
							<br />• 查看页面源码，可以看到这个时间已经渲染在 HTML 中
						</p>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm text-blue-800">
							💡 <strong>关键点：</strong>
							<br />
							"use client" 只影响**直接导入**的组件
							<br />
							通过 children prop 传递的组件保持原本的类型
							<br />
							Server Component → children → 仍然是 Server Component ✅
						</p>
					</div>
				</div>

				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<p className="text-sm text-yellow-800">
						⚠️ <strong>对比：</strong>
						<br />
						如果你在 template.tsx 中直接 import 这个组件：
						<br />
						<code className="bg-gray-200 px-2 py-1 rounded">
							import ServerComponentPage from "./page"
						</code>
						<br />
						那么它就会变成 Client Component ❌
					</p>
				</div>
			</div>
		</div>
	);
}
