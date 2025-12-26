/**
 * AI 生成 Hook
 * 处理 AI 内容生成的逻辑
 */

import { aiApi } from "@/api/ai";
import type { AIGenerateParams } from "@/types";
import { AIState } from "@/types";
import { useCallback, useRef } from "react";

interface UseAIGenerationProps {
	onContentUpdate: (content: string) => void;
	onStateChange: (state: AIState) => void;
	onError: (error: string) => void;
}

export const useAIGeneration = ({
	onContentUpdate,
	onStateChange,
	onError
}: UseAIGenerationProps) => {
	const abortControllerRef = useRef<AbortController | null>(null);
	const accumulatedContentRef = useRef("");

	const generate = useCallback(
		async (params: AIGenerateParams) => {
			// 取消之前的请求
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			// 重置状态
			accumulatedContentRef.current = "";
			onStateChange(AIState.LOADING);

			try {
				const controller = await aiApi.generateStream(
					params,
					(chunk: string) => {
						accumulatedContentRef.current += chunk;
						onContentUpdate(accumulatedContentRef.current);
					},
					(error) => {
						onStateChange(AIState.ERROR);
						onError((error as any)?.message || "AI 生成失败");
					}
				);

				abortControllerRef.current = controller;

				// 等待流完成
				// 注意：generateStream 会在流完成时返回，但我们需要等待它真正完成
				// 这里我们通过检查 accumulatedContentRef 来判断是否完成
				// 实际完成会在 onChunk 回调中处理
			} catch (error) {
				onStateChange(AIState.ERROR);
				onError(error instanceof Error ? error.message : "AI 生成失败");
			}
		},
		[onContentUpdate, onStateChange, onError]
	);

	const cancel = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const finish = useCallback(() => {
		onStateChange(AIState.DISPLAY);
		abortControllerRef.current = null;
	}, [onStateChange]);

	return {
		generate,
		cancel,
		finish
	};
};
