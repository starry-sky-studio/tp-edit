import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/utils/auth-storage";

/**
 * 检查 token 是否有效（非空且非无效值）
 */
function isValidToken(token: string | undefined): boolean {
	return !!(
		token &&
		token !== "undefined" &&
		token !== "null" &&
		token.length > 0
	);
}

/**
 * 清除所有认证相关的 cookies（服务器端）
 * 使用 auth-storage 中定义的常量确保一致性
 */
function clearAuthCookies(response: NextResponse): void {
	AUTH_COOKIE_NAMES.forEach((cookieName) => {
		response.cookies.delete(cookieName);
	});
}

/**
 * 重定向到登录页，并保存原始 URL
 */
function redirectToAuth(
	request: NextRequest,
	clearCookies = false
): NextResponse {
	const { pathname, search } = request.nextUrl;
	const redirectPath = pathname + search;

	const loginUrl = new URL("/login", request.url);

	// 保存原始路径，登录后可以跳转回来
	if (redirectPath && redirectPath !== "/login" && redirectPath !== "/") {
		loginUrl.searchParams.set("redirect_to", encodeURIComponent(redirectPath));
	}

	const response = NextResponse.redirect(loginUrl);

	// 如果需要清除 cookies
	if (clearCookies) {
		clearAuthCookies(response);
	}

	return response;
}

/**
 * 中间件：检查是否有有效的 token
 * 如果有有效的 token 则放行，否则重定向到登录页面
 *
 * 注意：过期检查交给服务器端 API 完成
 * 如果 API 返回 401，客户端会自动处理（刷新 token 或跳转登录）
 */
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	console.log("[Middleware] proxy-request", pathname);

	// 放行的路径（不需要鉴权）
	if (
		pathname.startsWith("/login") || // 登录相关
		pathname.startsWith("/signup") || // 注册相关
		pathname.startsWith("/static") || // 静态资源
		pathname.startsWith("/_next") || // Next.js 内部路径
		pathname.startsWith("/api") // API 路由（API 路由自己处理鉴权）
	) {
		return NextResponse.next(); // 放行
	}

	// 从 cookie 获取 token
	const token = request.cookies.get("auth_token")?.value;

	// 检查 token 是否存在且有效
	if (!isValidToken(token)) {
		console.log("[Middleware] No valid token found, redirecting to login");
		return redirectToAuth(request);
	}

	// 注意：过期检查交给服务器端 API 完成
	// 如果 API 返回 401，客户端会自动处理（刷新 token 或跳转登录）

	// Token 有效，继续请求
	console.log("[Middleware] Token valid, allowing request");
	return NextResponse.next();
}

export const config = {
	// 登录和注册放行 其他的页面需要进行检验
	// 所有请求都需要经过代理
	matcher: "/:path*"
};
