"use client"; // Error boundaries must be Client Components
import Link from "next/link";

export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		// global-error must include html and body tags
		<html lang="en">
			<body>
				<h2>Something went wrong!</h2>
				<button onClick={() => reset()}>Try again</button>
				<Link href="/">back to home page</Link>
			</body>
		</html>
	);
}
