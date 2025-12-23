/**
 * 用户信息
 */
export interface UserType {
	id: number;
	email: string;
	name?: string;
	avatarUrl?: string;
	createdAt: string;
}

/**
 * 登录/注册响应
 */
export interface AuthResponse {
	user: UserType;
	token: string;
	refresh_token: string;
	provider?: "google" | "github";
}

/**
 * 刷新token响应
 */
export interface RefreshTokenResponse {
	token: string;
	refresh_token: string;
}

/**
 * 登录参数
 */
export interface LoginParamsType {
	email: string;
	password: string;
}

/**
 * 注册参数
 */
export interface SignupParamsType {
	email: string;
	password: string;
	name?: string;
}

/**
 * 第三方登录参数
 */
export interface OAuthLoginParamsType {
	providerAccountId: string;
	email?: string;
	name?: string;
	avatarUrl?: string;
	accessToken?: string;
	refreshToken?: string;
}

/**
 * 刷新token参数
 */
export interface RefreshTokenParams {
	refresh_token: string;
}
