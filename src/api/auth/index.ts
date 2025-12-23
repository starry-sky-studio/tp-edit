import type {
	AuthResponse,
	LoginParamsType,
	OAuthLoginParamsType,
	RefreshTokenResponse,
	SignupParamsType,
} from "@/types/auth";
import type { ErrorHandler } from "../request";
import request from "../request";

/**
 * 认证服务API
 */
export const authApi = {
	/**
	 * 用户注册
	 * @param params 注册参数（邮箱、密码、昵称）
	 * @param errorHandler 自定义错误处理函数
	 * @returns 认证结果，包含用户信息和token
	 */
	signup: (params: SignupParamsType, errorHandler?: ErrorHandler) =>
		request.post<AuthResponse>("/auth/signup", {
			params,
			errorHandler,
		}),

	/**
	 * 用户登录
	 * @param params 登录参数（邮箱、密码）
	 * @param errorHandler 自定义错误处理函数
	 * @returns 认证结果，包含用户信息和token
	 */
	login: (params: LoginParamsType, errorHandler?: ErrorHandler) =>
		request.post<AuthResponse>("/auth/login", {
			params,
			errorHandler,
		}),

	/**
	 * 刷新访问令牌
	 * @param refreshToken 刷新令牌
	 * @param errorHandler 自定义错误处理函数
	 * @returns 新的访问令牌和刷新令牌
	 * @note 此接口通常由 request.ts 内部自动调用，当检测到 401 错误时会自动刷新 token
	 */
	refreshToken: (refreshToken: string, errorHandler?: ErrorHandler) =>
		request.post<RefreshTokenResponse>("/auth/refresh", {
			params: { refresh_token: refreshToken },
			errorHandler,
		}),

	/**
	 * 第三方登录（Google / GitHub）
	 * @param provider 第三方登录提供商（google 或 github）
	 * @param params 第三方登录参数
	 * @param errorHandler 自定义错误处理函数
	 * @returns 认证结果，包含用户信息和token
	 */
	oauthLogin: (
		provider: "google" | "github",
		params: OAuthLoginParamsType,
		errorHandler?: ErrorHandler,
	) =>
		request.post<AuthResponse>(`/auth/oauth/${provider}`, {
			params,
			errorHandler,
		}),

	/**
	 * 退出登录
	 * @param errorHandler 自定义错误处理函数
	 * @returns 退出登录结果
	 * @note 此接口主要用于清除服务端的会话信息，前端需要自行清除本地存储的token
	 */
	logout: (errorHandler?: ErrorHandler) =>
		request.post<{ success: boolean }>("/auth/logout", {
			errorHandler,
		}),
};

export default authApi;
