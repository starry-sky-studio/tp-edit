import Tiptap from "@/features/editor/Tiptap";

export default function Home() {
	return (
		<div className="h-screen w-screen overflow-auto bg-gray-50 flex justify-center items-start">
			<Tiptap />
		</div>
	);
}
