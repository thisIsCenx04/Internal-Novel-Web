package com.novelweb.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final String[] allowedOrigins;

    public WebConfig(@Value("${CORS_ALLOWED_ORIGINS:*}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        var mapping = registry.addMapping("/api/**")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);

        boolean allowAll = Arrays.stream(allowedOrigins).anyMatch(value -> value.equals("*"));
        if (allowAll) {
            mapping.allowedOriginPatterns("*");
        } else {
            mapping.allowedOrigins(allowedOrigins);
        }
    }
}
