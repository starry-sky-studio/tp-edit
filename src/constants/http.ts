/**
 * HTTP 状态码对应的错误消息
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
	200: "请求成功",
	201: "创建成功",
	300: "重定向",
	400: "请求参数错误",
	401: "未授权，请重新登录",
	403: "拒绝访问",
	404: "请求地址不存在",
	418: "我是一个茶壶",
	500: "服务器内部错误"
};

/**
 * HTTP 请求方法
 */
export const HTTP_METHODS = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
	PATCH: "PATCH"
} as const;
