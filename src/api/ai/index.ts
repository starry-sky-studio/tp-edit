/**
 * AI API 服务
 * 处理与 AI 服务的通信
 */

import type { ErrorHandler } from "@/api/request";
import request from "@/api/request";
import type { AIGenerateParams } from "@/types";

export interface AIGenerateResponse {
	content: string;
	model: string;
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

/**
 * AI API 服务
 */
export const aiApi = {
	/**
	 * 生成 AI 内容（流式响应）
	 * 使用 request.sseStream 封装，自动处理 token、错误处理等
	 *
	 * @param params 生成参数
	 * @param onChunk 流式数据回调（接收解析后的 content 字符串）
	 * @param errorHandler 错误处理函数
	 * @returns AbortController 用于取消请求
	 */
	generateStream: async (
		params: AIGenerateParams,
		onChunk: (chunk: string) => void,
		errorHandler?: ErrorHandler
	): Promise<AbortController> => {
		return request.sseStream(
			"/ai/generate",
			{
				params: {
					prompt: params.prompt,
					model: params.model || "gpt-3.5-turbo",
					temperature: params.temperature ?? 0.7,
					maxTokens: params.maxTokens ?? 1000,
					stream: true
				},
				errorHandler
			},
			(data: string) => {
				// 解析 SSE 数据
				// 支持两种格式：
				// 1. JSON 格式：{"content": "xxx"}
				// 2. 纯文本格式："xxx"
				try {
					const parsed = JSON.parse(data);
					if (parsed.content && typeof parsed.content === "string") {
						// JSON 格式，提取 content 字段
						onChunk(parsed.content);
					} else if (typeof parsed === "string") {
						// 如果解析后是字符串，直接使用
						onChunk(parsed);
					}
				} catch {
					// 如果不是 JSON，直接作为文本处理
					if (data.trim()) {
						onChunk(data);
					}
				}
			},
			(error: Error) => {
				// 错误处理
				if (errorHandler) {
					if (typeof errorHandler === "function") {
						errorHandler(error);
					} else if (errorHandler.onError) {
						errorHandler.onError(error);
					} else if (errorHandler.default) {
						errorHandler.default(error);
					}
				} else {
					console.error("AI 生成失败:", error);
				}
			}
		);
	},

	/**
	 * 生成 AI 内容（非流式）
	 * @param params 生成参数
	 * @param errorHandler 错误处理函数
	 * @returns 生成的内容
	 */
	generate: (params: AIGenerateParams, errorHandler?: ErrorHandler) =>
		request.post<AIGenerateResponse>("/ai/generate", {
			params: {
				prompt: params.prompt,
				model: params.model || "gpt-3.5-turbo",
				temperature: params.temperature ?? 0.7,
				maxTokens: params.maxTokens ?? 1000,
				stream: false
			},
			errorHandler
		})
};
