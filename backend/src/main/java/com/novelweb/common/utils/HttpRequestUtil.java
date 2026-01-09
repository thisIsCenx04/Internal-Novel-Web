package com.novelweb.common.utils;

import jakarta.servlet.http.HttpServletRequest;

public final class HttpRequestUtil {
    private HttpRequestUtil() {}

    public static String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
