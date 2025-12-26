/**
 * AI 功能相关类型定义
 */

export enum AIState {
	INPUT = "input",
	LOADING = "loading",
	DISPLAY = "display",
	ERROR = "error"
}

export interface AINodeAttributes {
	prompt: string;
	state: AIState;
	content: string;
	model?: string;
	error?: string;
}

export interface AIGenerateParams {
	prompt: string;
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

export interface AIStreamChunk {
	content: string;
	done?: boolean;
}
