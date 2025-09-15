import { Loading as LoadingIcon } from "@/styles/svg";
export default function Loading() {
	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="h-screen flex w-screen animate-pulse items-center justify-center bg-white p-4">
				<LoadingIcon
					style={{ color: "var(--color-primary)" }}
					className="text-7xl"
				/>
			</div>
		</div>
	);
}
