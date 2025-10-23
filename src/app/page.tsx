import Tiptap from "@/features/editor/Tiptap";
import { useUserUIStore } from "@/stores/userStore";

export default function Home() {
	return (
		<div className="h-screen w-screen overflow-auto bg-gray-50 flex justify-center items-start">
			{useUserUIStore.getState().showCustomHeader ? "1" : "0"}
			<button>toggler</button>
			<Tiptap />
		</div>
	);
}
