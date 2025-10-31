"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { useImageControls } from "@/hooks/use-image-controls";
import { useImageSelection } from "@/hooks/use-image-selection";
import { Loading } from "@/styles/svg";
import CalloutMenu from "./components/Callout/callout-menu";
import Footer from "./components/Footer";
import BubbleMenuComp from "./components/Menus/BubbleMenu/index";
import FixedMenuComp from "./components/Menus/FixedMenu/index";
import { baseExtensions } from "./extensions";

const Tiptap = () => {
	const [mounted, setMounted] = useState(false);

	const editor = useEditor({
		extensions: baseExtensions,
		content: `<p>Hello World! 🌎️</p> 
		<pre><code class="language-javascript">for (var i=1; i <= 20; i++)
{
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre>`,
		editorProps: {
			attributes: {
				class:
					"prose w-full h-[calc(100vh-65px)] overflow-auto prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 min-h-[300px] bg-white border border-gray-300 focus:outline-none scrollbar-hide",
			},
		},
		autofocus: true,
		editable: true,
		immediatelyRender: false,
		injectCSS: true,
	});

	const { selectedImageNode, imageDom, hoveredImageNode, hoveredImageDom } =
		useImageSelection(editor);

	useImageControls({
		imageDom,
		selectedImageNode,
		hoveredImageDom,
		hoveredImageNode,
		editor,
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !editor)
		return (
			<div className="h-screen flex w-screen animate-pulse items-center justify-center bg-white p-4">
				<Loading
					style={{ color: "var(--color-primary)" }}
					className="text-7xl"
				/>
			</div>
		);

	return (
		<div className="relative h-screen w-[1200px] bg-white">
			<FixedMenuComp editor={editor} />
			<BubbleMenuComp editor={editor} />
			<CalloutMenu editor={editor} />
			<div className="relative">
				<EditorContent
					className="w-full [&_.ProseMirror]:w-full [&_.ProseMirror]:max-w-none"
					editor={editor}
				/>
			</div>
			<Footer />
		</div>
	);
};

export default Tiptap;
