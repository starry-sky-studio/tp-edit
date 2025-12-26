/**
 * AI 节点视图组件
 * 处理 AI 节点的 UI 显示和交互
 */

"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Bot, Check, Loader2, RefreshCw, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AIGenerateParams } from "@/types";
import { AIState } from "@/types";
import { useAIGeneration } from "../hooks/use-ai-generation";

export const AIView = (props: ReactNodeViewProps) => {
	const { node, updateAttributes, editor } = props;
	const { prompt, state, content, model, error } = node.attrs;

	const [inputPrompt, setInputPrompt] = useState(prompt || "");
	const [displayContent, setDisplayContent] = useState(content || "");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handleContentUpdate = (newContent: string) => {
		setDisplayContent(newContent);
		updateAttributes({ content: newContent });
	};

	const handleStateChange = (newState: AIState) => {
		updateAttributes({ state: newState });
	};

	const handleError = (errorMessage: string) => {
		updateAttributes({ state: AIState.ERROR, error: errorMessage });
	};

	const { generate, cancel, finish } = useAIGeneration({
		onContentUpdate: handleContentUpdate,
		onStateChange: handleStateChange,
		onError: handleError
	});

	// 当状态变为 DISPLAY 时，标记完成
	useEffect(() => {
		if (state === AIState.DISPLAY) {
			finish();
		}
	}, [state, finish]);

	// 聚焦输入框
	useEffect(() => {
		if (state === AIState.INPUT && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [state]);

	const handleSubmit = async () => {
		if (!inputPrompt.trim()) {
			return;
		}

		updateAttributes({
			prompt: inputPrompt,
			state: AIState.LOADING,
			error: ""
		});
		setDisplayContent("");

		const params: AIGenerateParams = {
			prompt: inputPrompt,
			model: model || "gpt-3.5-turbo"
		};

		await generate(params);
	};

	const handleCancel = () => {
		cancel();
		updateAttributes({ state: AIState.INPUT });
	};

	const handleRetry = () => {
		if (prompt) {
			updateAttributes({ state: AIState.LOADING, error: "" });
			setDisplayContent("");
			generate({
				prompt,
				model: model || "gpt-3.5-turbo"
			});
		}
	};

	const handleRegenerate = () => {
		updateAttributes({ state: AIState.INPUT });
		setInputPrompt("");
		setDisplayContent("");
	};

	const handleConvertToText = () => {
		if (!displayContent) return;

		// 删除 AI 节点
		editor.commands.deleteSelection();

		// 插入生成的内容
		editor.commands.insertContent(displayContent);
	};

	return (
		<NodeViewWrapper className="ai-node my-4 flex justify-center">
			<div
				className="w-full  rounded-full border border-gray-200 bg-white"
				contentEditable={false}
			>
				{state === AIState.INPUT && (
					<div className="flex items-center gap-3 px-4 py-3">
						{/* 左侧 AI 图标 */}
						<Bot className="h-5 w-5 shrink-0 text-gray-600" />

						{/* 输入框 */}
						<div className="flex-1">
							<Textarea
								ref={inputRef}
								placeholder="随便问些什么"
								value={inputPrompt}
								onChange={(e) => setInputPrompt(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
										e.preventDefault();
										handleSubmit();
									}
								}}
								className="min-h-[24px] max-h-[96px] resize-none overflow-y-auto border-0 bg-transparent px-0 py-1 text-sm leading-[1.5] text-gray-700 placeholder:text-gray-400 shadow-none focus-visible:ring-0"
							/>
						</div>

						{/* 右侧发送按钮 */}
						<Button
							size="icon"
							className="h-8 w-8 shrink-0 rounded-full bg-gray-600 text-white transition-colors hover:bg-gray-700"
							onClick={handleSubmit}
							disabled={!inputPrompt.trim()}
							title="发送 (Cmd/Ctrl + Enter)"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				)}

				{state === AIState.LOADING && (
					<div className="p-4">
						<div className="mb-3 flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-gray-400" />
							<p className="text-sm text-gray-600">{prompt}</p>
						</div>
						{displayContent && (
							<div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
								<div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
									{displayContent}
								</div>
							</div>
						)}
						<div className="flex items-center justify-end">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700"
								onClick={handleCancel}
								title="停止"
							>
								<Square className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{state === AIState.DISPLAY && (
					<div className="p-4">
						<div className="mb-3 flex items-center gap-2">
							<Bot className="h-4 w-4 text-gray-400" />
							<p className="text-sm text-gray-600">{prompt}</p>
						</div>
						<div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
							<div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
								{displayContent || content}
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-gray-500 hover:text-gray-700"
								onClick={handleRegenerate}
							>
								<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
								重新生成
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-gray-500 hover:text-gray-700"
								onClick={handleConvertToText}
							>
								<Check className="mr-1.5 h-3.5 w-3.5" />
								插入到文档
							</Button>
						</div>
					</div>
				)}

				{state === AIState.ERROR && (
					<div className="p-4">
						<div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
							<p className="text-sm text-red-600">
								{error || "生成失败，请重试"}
							</p>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700"
								onClick={handleRetry}
								title="重试"
							>
								<RefreshCw className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700"
								onClick={() => {
									updateAttributes({ state: AIState.INPUT });
								}}
								title="编辑提示词"
							>
								<Bot className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</NodeViewWrapper>
	);
};
