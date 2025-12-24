/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * 统一管理前端本地的认证令牌读写。
 * 使用 Cookie 存储（服务器端和客户端都可访问）。
 * 仅在浏览器环境下操作 Cookie，避免 SSR 报错。
 */

export interface AuthTokens {
	token: string | null;
	refreshToken: string | null;
}

export interface AuthTokenData {
	token: string;
	refreshToken?: string;
	expiresIn?: number; // 过期时间（秒）
	refreshExpiresIn?: number; // 刷新 token 过期时间（秒）
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_IN_KEY = "expires_in";
const REFRESH_EXPIRES_IN_KEY = "refresh_expires_in";

/**
 * 所有认证相关的 Cookie 名称列表
 * 用于服务器端和客户端统一管理
 */
export const AUTH_COOKIE_NAMES = [
	TOKEN_KEY,
	REFRESH_TOKEN_KEY,
	EXPIRES_IN_KEY,
	REFRESH_EXPIRES_IN_KEY
] as const;

// Cookie 配置
const COOKIE_OPTIONS = {
	path: "/",
	sameSite: "lax" as const,
	secure: process.env.NODE_ENV === "production" // 生产环境使用 HTTPS
};

// biome-ignore lint/complexity/noStaticOnlyClass: 允许静态工具类
export class AuthStorage {
	private static isBrowser() {
		return typeof window !== "undefined";
	}

	private static readonly TOKEN_KEY = TOKEN_KEY;
	private static readonly REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;
	private static readonly EXPIRES_IN_KEY = EXPIRES_IN_KEY;
	private static readonly REFRESH_EXPIRES_IN_KEY = REFRESH_EXPIRES_IN_KEY;

	/**
	 * 设置 Cookie
	 */
	private static setCookie(name: string, value: string, days?: number): void {
		if (!AuthStorage.isBrowser()) return;

		let expires = "";
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = `; expires=${date.toUTCString()}`;
		}

		const secure = COOKIE_OPTIONS.secure ? "; secure" : "";
		const sameSite = `; samesite=${COOKIE_OPTIONS.sameSite}`;
		// 直接操作 document.cookie 是浏览器 API 的标准用法
		document.cookie = `${name}=${value}${expires}; path=${COOKIE_OPTIONS.path}${secure}${sameSite}`;
	}

	/**
	 * 获取 Cookie
	 */
	private static getCookie(name: string): string | null {
		if (!AuthStorage.isBrowser()) return null;

		const nameEQ = `${name}=`;
		const ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === " ") c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	/**
	 * 删除 Cookie
	 */
	private static deleteCookie(name: string): void {
		if (!AuthStorage.isBrowser()) return;
		// 直接操作 document.cookie 是浏览器 API 的标准用法
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_OPTIONS.path};`;
	}

	/**
	 * 设置认证令牌（只使用 Cookie 存储）
	 */
	static setAuthTokens(
		token?: string | null,
		refreshToken?: string | null,
		expiresIn?: number,
		refreshExpiresIn?: number
	): void {
		if (!AuthStorage.isBrowser()) return;

		// 计算过期天数
		const tokenDays = expiresIn ? Math.ceil(expiresIn / (24 * 60 * 60)) : 7; // 默认 7 天
		const refreshDays = refreshExpiresIn
			? Math.ceil(refreshExpiresIn / (24 * 60 * 60))
			: 30; // 默认 30 天

		// 设置 token
		if (token) {
			AuthStorage.setCookie(AuthStorage.TOKEN_KEY, token, tokenDays);
		}

		// 设置 refreshToken
		if (refreshToken) {
			AuthStorage.setCookie(
				AuthStorage.REFRESH_TOKEN_KEY,
				refreshToken,
				refreshDays
			);
		}

		// 设置过期时间（可选，用于客户端判断）
		if (expiresIn) {
			AuthStorage.setCookie(
				AuthStorage.EXPIRES_IN_KEY,
				String(expiresIn),
				tokenDays
			);
		}
		if (refreshExpiresIn) {
			AuthStorage.setCookie(
				AuthStorage.REFRESH_EXPIRES_IN_KEY,
				String(refreshExpiresIn),
				refreshDays
			);
		}
	}

	/**
	 * 获取认证令牌（从 Cookie 读取）
	 */
	static getAuthTokens(): AuthTokens {
		if (!AuthStorage.isBrowser()) {
			return { token: null, refreshToken: null };
		}

		const token = AuthStorage.getCookie(AuthStorage.TOKEN_KEY);
		const refreshToken = AuthStorage.getCookie(AuthStorage.REFRESH_TOKEN_KEY);

		return {
			token,
			refreshToken
		};
	}

	/**
	 * 清除所有认证令牌（Cookie）
	 */
	static clearAuthTokens(): void {
		if (!AuthStorage.isBrowser()) return;

		// 清除 Cookie
		AuthStorage.deleteCookie(AuthStorage.TOKEN_KEY);
		AuthStorage.deleteCookie(AuthStorage.REFRESH_TOKEN_KEY);
		AuthStorage.deleteCookie(AuthStorage.EXPIRES_IN_KEY);
		AuthStorage.deleteCookie(AuthStorage.REFRESH_EXPIRES_IN_KEY);
	}
}

// 兼容原先的函数式调用（可选）
export const setAuthTokens = AuthStorage.setAuthTokens;
export const getAuthTokens = AuthStorage.getAuthTokens;
export const clearAuthTokens = AuthStorage.clearAuthTokens;

export default AuthStorage;
