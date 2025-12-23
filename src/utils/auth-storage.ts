/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * 统一管理前端本地的认证令牌读写。
 * 仅在浏览器环境下访问 localStorage，避免 SSR 报错。
 */

export interface AuthTokens {
	token: string | null;
	refreshToken: string | null;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// biome-ignore lint/complexity/noStaticOnlyClass: 允许静态工具类
export class AuthStorage {
	private static isBrowser() {
		return typeof window !== "undefined";
	}

	private static readonly TOKEN_KEY = TOKEN_KEY;
	private static readonly REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;

	static setAuthTokens(token?: string | null, refreshToken?: string | null) {
		if (!AuthStorage.isBrowser()) return;
		if (token) {
			localStorage.setItem(AuthStorage.TOKEN_KEY, token);
		}
		if (refreshToken) {
			localStorage.setItem(AuthStorage.REFRESH_TOKEN_KEY, refreshToken);
		}
	}

	static getAuthTokens(): AuthTokens {
		if (!AuthStorage.isBrowser()) {
			return { token: null, refreshToken: null };
		}
		return {
			token: localStorage.getItem(AuthStorage.TOKEN_KEY),
			refreshToken: localStorage.getItem(AuthStorage.REFRESH_TOKEN_KEY),
		};
	}

	static clearAuthTokens() {
		if (!AuthStorage.isBrowser()) return;
		localStorage.removeItem(AuthStorage.TOKEN_KEY);
		localStorage.removeItem(AuthStorage.REFRESH_TOKEN_KEY);
	}
}

// 兼容原先的函数式调用（可选）
export const setAuthTokens = AuthStorage.setAuthTokens;
export const getAuthTokens = AuthStorage.getAuthTokens;
export const clearAuthTokens = AuthStorage.clearAuthTokens;

export default AuthStorage;
