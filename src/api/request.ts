/**
 * HTTP 请求封装类
 * - 使用原生 fetch API
 * - 支持自动 token 刷新、请求重试、统一错误处理
 */

import { HTTP_METHODS, HTTP_STATUS_MESSAGES } from "@/constants/http";
import {
	clearAuthTokens,
	getAuthTokens,
	setAuthTokens
} from "@/utils/auth-storage";
import { fetchEventSource } from "@microsoft/fetch-event-source";

type Method = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

interface RequestParams {
	params?: Record<string, any>;
	timeout?: number;
	retries?: number;
	retryDelay?: number;
	headers?: Record<string, string>;
	withCredentials?: boolean;
	signal?: AbortSignal;
	errorHandler?: ErrorHandler;
}

interface RequestConfig extends RequestParams {
	url: string;
	method: Method;
	mode?: RequestMode;
	token?: string;
}

export class RequestError extends Error {
	url: string;
	status?: number;
	statusText?: string;
	data?: any;

	constructor(
		message: string,
		url: string,
		status?: number,
		statusText?: string,
		data?: any
	) {
		super(message);
		this.name = "RequestError";
		this.url = url;
		this.status = status;
		this.statusText = statusText;
		this.data = data;
	}
}

export interface ApiResponse<T> {
	code: number;
	message: string;
	data: T;
	timestamp?: number;
}

export interface RequestResult<T> {
	data: ApiResponse<T> | null;
	error: string | null;
	status?: number;
}

export type ErrorHandler =
	| ((error: unknown) => void)
	| {
			onError?: (error: unknown) => void;
			unauthorized?: () => void;
			forbidden?: () => void;
			serverError?: () => void;
			networkError?: () => void;
			default?: (error: unknown) => void;
	  };

interface QueuedRequest {
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
	requestFn: () => Promise<any>;
}

class Request {
	baseURL: string;
	defaultTimeout: number;
	defaultRetries: number;
	defaultRetryDelay: number;

	private maxRefreshAttempts = 2;
	private currentRefreshAttempts = 0;
	private isRefreshing = false;
	private refreshTokenPromise: Promise<string> | null = null;
	private failedQueue: QueuedRequest[] = [];

	constructor(
		baseURL: string,
		options?: {
			timeout?: number;
			retries?: number;
			retryDelay?: number;
		}
	) {
		this.baseURL = baseURL;
		this.defaultTimeout = options?.timeout || 10000;
		this.defaultRetries = options?.retries || 0;
		this.defaultRetryDelay = options?.retryDelay || 1000;
	}

	private createTimeoutPromise(timeout: number): Promise<never> {
		return new Promise((_resolve, reject) => {
			setTimeout(() => {
				reject(new RequestError("请求超时", "", undefined, "Timeout"));
			}, timeout);
		});
	}

	/**
	 * 获取 token（从 Cookie 读取，统一由 AuthStorage 管理）
	 */
	private getToken(): string | null {
		if (typeof window === "undefined") return null;
		return getAuthTokens().token;
	}

	/**
	 * 清除认证数据（使用 AuthStorage 统一管理 Cookie）
	 */
	private clearAuthData(): void {
		if (typeof window === "undefined") return;
		clearAuthTokens();
	}

	private handleAuthFailure(): void {
		this.clearAuthData();
		if (typeof window !== "undefined") {
			const currentPath = window.location.pathname + window.location.search;
			const loginUrl = "/login";
			if (currentPath && currentPath !== loginUrl) {
				window.location.href = `${loginUrl}?redirect_to=${encodeURIComponent(currentPath)}`;
			} else {
				window.location.href = loginUrl;
			}
		}
	}

	private async refreshAccessToken(): Promise<string> {
		const refreshToken =
			typeof window !== "undefined" ? getAuthTokens().refreshToken : null;

		if (!refreshToken) {
			throw new RequestError(
				"未找到刷新令牌，请重新登录",
				"",
				401,
				"Unauthorized"
			);
		}

		try {
			const refreshUrl = `${this.baseURL}/auth/refresh`;
			const response = await fetch(refreshUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: refreshToken })
			});

			if (!response.ok) {
				this.handleAuthFailure();
				throw new RequestError(
					"刷新令牌失败，请重新登录",
					refreshUrl,
					response.status,
					response.statusText
				);
			}

			const result = await response.json();

			if (
				result.code !== undefined &&
				result.code !== 0 &&
				(result.code < 200 || result.code >= 300)
			) {
				this.handleAuthFailure();
				throw new RequestError(
					result.message,
					refreshUrl,
					401,
					"Unauthorized",
					result
				);
			}

			const tokenData = result.data ?? {};
			const {
				token: newToken,
				refresh_token: newRefreshToken,
				expires_in: expiresIn,
				refresh_expires_in: refreshExpiresIn
			} = tokenData;

			if (newToken) {
				setAuthTokens(newToken, newRefreshToken, expiresIn, refreshExpiresIn);
				return newToken;
			}

			throw new RequestError(
				"刷新令牌失败，请重新登录",
				refreshUrl,
				401,
				"Unauthorized"
			);
		} catch (error) {
			this.handleAuthFailure();
			throw error;
		}
	}

	private async handleTokenRefresh(): Promise<string> {
		if (this.isRefreshing && this.refreshTokenPromise) {
			return this.refreshTokenPromise;
		}

		if (this.currentRefreshAttempts >= this.maxRefreshAttempts) {
			throw new RequestError(
				"刷新令牌次数过多，请重新登录",
				"",
				401,
				"Unauthorized"
			);
		}

		this.isRefreshing = true;
		this.currentRefreshAttempts += 1;

		this.refreshTokenPromise = this.refreshAccessToken()
			.then((newToken) => {
				this.isRefreshing = false;
				this.refreshTokenPromise = null;
				this.currentRefreshAttempts = 0;
				this.processQueue(null);
				return newToken;
			})
			.catch((error) => {
				this.isRefreshing = false;
				this.refreshTokenPromise = null;
				this.processQueue(error);
				throw error;
			});

		return this.refreshTokenPromise;
	}

	private processQueue(error: Error | null) {
		this.failedQueue.forEach((queuedRequest) => {
			if (error) {
				queuedRequest.reject(error);
			} else {
				queuedRequest
					.requestFn()
					.then(queuedRequest.resolve)
					.catch(queuedRequest.reject);
			}
		});
		this.failedQueue = [];
	}

	private addRequestToQueue(requestFn: () => Promise<any>): Promise<any> {
		return new Promise((resolve, reject) => {
			this.failedQueue.push({ resolve, reject, requestFn });
		});
	}

	private interceptorsRequest({
		url,
		method,
		params,
		mode,
		token,
		headers: customHeaders,
		withCredentials
	}: RequestConfig) {
		const headers: Record<string, string> = { ...customHeaders };
		const authToken = token || this.getToken();

		if (authToken) {
			headers["Authorization"] = `Bearer ${authToken}`;
		}

		let requestPayload: any;

		if (method === HTTP_METHODS.GET || method === HTTP_METHODS.DELETE) {
			if (params) {
				const queryParams = new URLSearchParams(
					Object.entries(params)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				if (queryParams) url = `${url}?${queryParams}`;
			}
		} else if (params) {
			if (params instanceof FormData || params instanceof URLSearchParams) {
				requestPayload = params;
			} else {
				headers["Content-Type"] = headers["Content-Type"] || "application/json";
				requestPayload = JSON.stringify(params);
			}
		}

		return {
			url,
			options: {
				method,
				headers,
				mode,
				credentials: (withCredentials
					? "include"
					: "same-origin") as RequestCredentials,
				body: requestPayload
			}
		};
	}

	private async interceptorsResponse<T>(
		res: Response,
		url: string
	): Promise<T> {
		const status = res.status;
		const statusText = res.statusText;

		if (!res.ok) {
			let errorMessage =
				HTTP_STATUS_MESSAGES[status] || `HTTP 错误: ${status} ${statusText}`;
			let errorData = null;

			try {
				const contentType = res.headers.get("content-type");
				if (contentType?.includes("application/json")) {
					errorData = await res.json();
					if (errorData.message) errorMessage = errorData.message;
				} else {
					const textData = await res.text();
					if (textData) errorMessage = textData;
				}
			} catch {
				// 忽略解析错误
			}

			throw new RequestError(errorMessage, url, status, statusText, errorData);
		}

		const contentType = res.headers.get("content-type");
		if (contentType && !contentType.includes("application/json")) {
			return res as unknown as T;
		}

		try {
			const data = await res.json();
			if (
				data &&
				data.code !== undefined &&
				data.code !== 0 &&
				(data.code < 200 || data.code >= 300)
			) {
				throw new RequestError(
					data.message || data.reason || "请求失败",
					url,
					status,
					statusText,
					data
				);
			}
			return data as T;
		} catch (error) {
			if (error instanceof RequestError) throw error;
			throw new RequestError("解析响应数据失败", url, status, statusText);
		}
	}

	private async executeWithRetry<T>(
		requestFn: () => Promise<T>,
		retries: number,
		retryDelay: number,
		isRetryAfterRefresh: boolean = false
	): Promise<T> {
		try {
			return await requestFn();
		} catch (error) {
			if (
				error instanceof RequestError &&
				error.status === 401 &&
				!isRetryAfterRefresh &&
				typeof window !== "undefined"
			) {
				// 从 Cookie 读取 refreshToken
				const refreshToken = getAuthTokens().refreshToken;
				if (!refreshToken) {
					throw error;
				}

				try {
					if (this.isRefreshing) {
						return this.addRequestToQueue(requestFn);
					}
					await this.handleTokenRefresh();
					return this.executeWithRetry(requestFn, 0, 0, true);
				} catch {
					this.handleAuthFailure();
					throw error;
				}
			}

			if (
				retries > 0 &&
				!(error instanceof RequestError && error.status === 401)
			) {
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				return this.executeWithRetry(
					requestFn,
					retries - 1,
					retryDelay,
					isRetryAfterRefresh
				);
			}

			throw error;
		}
	}

	private handleRequestError(
		error: unknown,
		fallbackMessage = "请求失败，请稍后重试",
		handlers?: {
			[key: number]: (error: RequestError) => void;
			default?: (error: unknown) => void;
			unauthorized?: () => void;
			forbidden?: () => void;
			serverError?: () => void;
			networkError?: () => void;
		}
	): string {
		if (error instanceof RequestError) {
			if (handlers && error.status) {
				if (handlers[error.status]) {
					handlers[error.status](error);
				} else if (error.status === 401 && handlers.unauthorized) {
					handlers.unauthorized();
				} else if (error.status === 403 && handlers.forbidden) {
					handlers.forbidden();
				} else if (error.status >= 500 && handlers.serverError) {
					handlers.serverError();
				} else if (handlers.default) {
					handlers.default(error);
				}
			} else if (handlers?.default) {
				handlers.default(error);
			}
			return error.message || fallbackMessage;
		}

		if (
			error instanceof TypeError &&
			(error.message.includes("Failed to fetch") ||
				error.message.includes("Network request failed"))
		) {
			handlers?.networkError?.();
			return "网络连接错误，请检查您的网络";
		}

		if (error instanceof DOMException && error.name === "AbortError") {
			return "请求已取消";
		}

		handlers?.default?.(error);
		return error instanceof Error ? error.message : fallbackMessage;
	}

	private async handleRequest<T>(
		requestFn: () => Promise<ApiResponse<T>>,
		errorHandler?: ErrorHandler
	): Promise<RequestResult<T>> {
		try {
			const data = await requestFn();
			return { data, error: null };
		} catch (error) {
			const handlers =
				typeof errorHandler === "function"
					? { default: errorHandler }
					: errorHandler;

			const errorMessage = this.handleRequestError(error, undefined, {
				...(handlers as any),
				default: handlers?.default || handlers?.onError
			});

			if (typeof errorHandler === "function") {
				errorHandler(error);
			} else if (errorHandler?.onError) {
				errorHandler.onError(error);
			}

			const status = error instanceof RequestError ? error.status : undefined;
			return { data: null, error: errorMessage, status };
		}
	}

	private async httpFactory<T>({
		url = "",
		params = {},
		method,
		mode,
		token,
		timeout = this.defaultTimeout,
		retries = this.defaultRetries,
		retryDelay = this.defaultRetryDelay,
		signal,
		...rest
	}: RequestConfig): Promise<T> {
		const fullUrl = this.baseURL + url;
		const req = this.interceptorsRequest({
			url: fullUrl,
			method,
			params: params.params,
			mode,
			token,
			headers: rest.headers,
			withCredentials: rest.withCredentials
		});

		const makeRequest = async (): Promise<T> => {
			const fetchPromise = fetch(req.url, { ...req.options, signal });
			const res = timeout
				? await Promise.race([fetchPromise, this.createTimeoutPromise(timeout)])
				: await fetchPromise;
			return this.interceptorsResponse<T>(res, fullUrl);
		};

		return this.executeWithRetry(makeRequest, retries, retryDelay);
	}

	// 通用请求方法，减少重复代码
	private request<T>(
		method: Method,
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.handleRequest<T>(
			() =>
				this.httpFactory<ApiResponse<T>>({
					url,
					params,
					method,
					mode,
					token,
					timeout: params?.timeout,
					retries: params?.retries,
					retryDelay: params?.retryDelay,
					signal: params?.signal,
					headers: params?.headers,
					withCredentials: params?.withCredentials
				}),
			params?.errorHandler
		);
	}

	get<T>(
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.request<T>(HTTP_METHODS.GET, url, params, mode, token);
	}

	post<T>(
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.request<T>(HTTP_METHODS.POST, url, params, mode, token);
	}

	put<T>(
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.request<T>(HTTP_METHODS.PUT, url, params, mode, token);
	}

	delete<T>(
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.request<T>(HTTP_METHODS.DELETE, url, params, mode, token);
	}

	patch<T>(
		url: string,
		params?: RequestParams,
		mode?: RequestMode,
		token?: string
	): Promise<RequestResult<T>> {
		return this.request<T>(HTTP_METHODS.PATCH, url, params, mode, token);
	}

	createCancelToken(): {
		signal: AbortSignal;
		cancel: (reason?: string) => void;
	} {
		const controller = new AbortController();
		return {
			signal: controller.signal,
			cancel: (reason?: string) => controller.abort(reason)
		};
	}

	/**
	 * SSE 流式请求（使用 @microsoft/fetch-event-source）
	 *
	 * ✅ 为什么使用现成的库？
	 * 1. 更成熟：经过大量测试，边界情况处理更完善
	 * 2. 维护成本低：由专业团队维护，减少 bug
	 * 3. 功能更全：自动重连、错误处理、流解析等
	 * 4. 减少自研代码：降低维护负担
	 *
	 * @param url 请求地址
	 * @param params 请求参数
	 * @param onMessage 收到消息时的回调
	 * @param onError 错误回调
	 * @returns AbortController，用于取消请求
	 */
	/**
	 * SSE 流式请求（使用 @microsoft/fetch-event-source）
	 *
	 * ✅ 为什么使用现成的库？
	 * 1. 更成熟：经过大量测试，边界情况处理更完善
	 * 2. 维护成本低：由专业团队维护，减少 bug
	 * 3. 功能更全：自动重连、错误处理、流解析等
	 * 4. 减少自研代码：降低维护负担
	 *
	 * 📝 关于状态管理：
	 * - SSE 是流式请求，不适合直接用 TanStack Query 的 mutation（mutation 是一次性的）
	 * - 状态管理在 hook 层处理更合适（如 use-ai-generation.ts）
	 * - 返回 AbortController 用于取消请求
	 *
	 * @param url 请求地址
	 * @param params 请求参数
	 * @param onMessage 收到消息时的回调
	 * @param onError 错误回调
	 * @returns AbortController，用于取消请求
	 */
	async sseStream(
		url: string,
		params?: RequestParams,
		onMessage?: (chunk: string) => void,
		onError?: (error: Error) => void
	): Promise<AbortController> {
		const controller = new AbortController();
		const fullUrl = this.baseURL + url;

		// 准备请求配置（复用现有的拦截器，自动处理 token）
		const req = this.interceptorsRequest({
			url: fullUrl,
			method: HTTP_METHODS.POST,
			params: params?.params,
			headers: {
				...params?.headers,
				Accept: "text/event-stream",
				"Cache-Control": "no-cache"
			},
			withCredentials: params?.withCredentials
		});

		// 使用 fetch-event-source 处理 SSE
		// 注意：这个库会自动处理 SSE 格式解析
		fetchEventSource(req.url, {
			method: "POST",
			headers: req.options.headers as Record<string, string>,
			body: req.options.body,
			credentials: req.options.credentials,
			signal: controller.signal,
			onmessage(ev: {
				data: string;
				event?: string;
				id?: string;
				retry?: number;
			}) {
				// 处理 SSE 消息
				if (ev.data === "[DONE]") {
					return;
				}
				if (onMessage) {
					try {
						onMessage(ev.data);
					} catch (err) {
						console.error("SSE onMessage 回调错误:", err);
					}
				}
			},
			onerror(err: unknown) {
				// 错误处理
				if (err instanceof DOMException && err.name === "AbortError") {
					// 请求被取消，这是预期行为
					return;
				}
				const error = err instanceof Error ? err : new Error(String(err));
				onError?.(error);

				// 调用统一的错误处理
				if (params?.errorHandler) {
					if (typeof params.errorHandler === "function") {
						params.errorHandler(error);
					} else if (params.errorHandler.onError) {
						params.errorHandler.onError(error);
					}
				}

				// 返回 undefined 让库自动重试（如果需要）
				// 如果需要停止重试，可以返回一个非 undefined 的值
			},
			openWhenHidden: true // 即使页面隐藏也保持连接
		}).catch((err: unknown) => {
			// 最终错误处理
			if (!(err instanceof DOMException && err.name === "AbortError")) {
				onError?.(err instanceof Error ? err : new Error(String(err)));
			}
		});

		return controller;
	}
}

const apiBase = `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/api`;

const request = new Request(apiBase, {
	timeout: 15000,
	retries: 1,
	retryDelay: 1000
});

export default request;
