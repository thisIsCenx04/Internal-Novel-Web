package com.novelweb.security.jwt;

import com.novelweb.domain.enums.SessionStatus;
import com.novelweb.modules.auth.session.SessionRepository;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final SessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                JwtClaims claims = jwtProvider.parse(token);
                sessionRepository.findById(claims.sessionId()).ifPresent(session -> {
                    if (session.getStatus() == SessionStatus.ACTIVE) {
                        session.setLastSeenAt(OffsetDateTime.now());
                        sessionRepository.save(session);
                        SecurityUserDetails principal = new SecurityUserDetails(
                            claims.userId(),
                            claims.sessionId(),
                            claims.role()
                        );
                        var auth = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                });
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
