import Tiptap from "../features/editor/Tiptap";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
			<Tiptap />

			<div style={{ marginLeft: 0, marginRight: "auto", width: "100%" }}>
				<div style={{ marginRight: "auto", width: "fit-content" }}>
					left (使用margin-right: auto)
				</div>
			</div>
			<div style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}>
				<div style={{ marginLeft: "auto", marginRight: "auto", width: "100%" }}>
					center
				</div>
			</div>
			<div style={{ marginLeft: "auto", marginRight: 0, width: "100%" }}>
				<div style={{ marginLeft: "auto", marginRight: 0, width: "100%" }}>
					right
				</div>
			</div>

			<div className="w-full max-w-4xl mt-8 space-y-4">
				{/* 左对齐 - 使用margin-right: auto */}
				<div className="w-full bg-white p-4 rounded-lg shadow">
					<div
						style={{ marginRight: "auto", width: "fit-content" }}
						className="text-blue-600 font-semibold"
					>
						left (使用margin-right: auto)
					</div>
				</div>

				{/* 居中对齐 - 使用左右margin: auto */}

				{/* 右对齐 - 使用margin-left: auto */}
				<div className="w-full bg-white p-4 rounded-lg shadow flex">
					<div
						style={{ marginLeft: "auto", width: "fit-content" }}
						className="text-red-600 font-semibold"
					>
						right (使用margin-left: auto)
					</div>
					<div
						style={{ marginLeft: "auto", marginRight: "auto" }}
						className="text-green-600 font-semibold"
					>
						center
					</div>
					<div
						style={{ marginRight: "auto", width: "fit-content" }}
						className="text-red-600 font-semibold"
					>
						right (使用marginRight: auto)
					</div>
				</div>

				{/* 在同一行中实现三种对齐方式 */}
				<div className="w-full bg-white p-4 rounded-lg shadow mt-6">
					<h3 className="text-gray-700 mb-3">同一行中的三种对齐方式：</h3>
					<div className=" ">
						<div
							style={{ marginRight: "auto" }}
							className="text-blue-600 font-semibold"
						>
							left
						</div>
						<div
							style={{ marginLeft: "auto", marginRight: "auto" }}
							className="text-green-600 font-semibold"
						>
							center
						</div>
						<div
							style={{ marginLeft: "auto" }}
							className="text-red-600 font-semibold"
						>
							right
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
