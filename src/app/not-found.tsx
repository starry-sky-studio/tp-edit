import Link from "next/link";

export default function NotFound() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				gap: "8px",
				fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
			}}
		>
			<h1 style={{ fontSize: "32px", fontWeight: 700 }}>404</h1>
			<p style={{ color: "#666" }}>This page could not be found.</p>
			<Link href="/">
				<button
					style={{
						marginTop: "12px",
						padding: "8px 16px",
						borderRadius: "999px",
						border: "1px solid #ddd",
						background: "#f5f5f5",
						cursor: "pointer",
					}}
				>
					返回首页
				</button>
			</Link>
		</div>
	);
}
