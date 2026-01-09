package com.novelweb.common.utils;

import java.text.Normalizer;

public final class SlugUtil {
    private SlugUtil() {}

    public static String toSlug(String input) {
        if (input == null) {
            return "";
        }
        String normalized = input.trim()
            .replace('đ', 'd')
            .replace('Đ', 'D');
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        normalized = normalized.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-+|-+$)", "");
        return normalized;
    }
}
