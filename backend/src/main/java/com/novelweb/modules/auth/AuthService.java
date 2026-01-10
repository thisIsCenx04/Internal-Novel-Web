package com.novelweb.modules.auth;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.utils.HttpRequestUtil;
import com.novelweb.common.utils.TokenUtil;
import com.novelweb.domain.entity.User;
import com.novelweb.domain.entity.UserSession;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.domain.enums.SessionStatus;
import com.novelweb.domain.enums.SingleSessionPolicy;
import com.novelweb.domain.enums.UserStatus;
import com.novelweb.modules.auth.dto.LoginRequest;
import com.novelweb.modules.auth.dto.LoginResponse;
import com.novelweb.modules.auth.dto.RefreshRequest;
import com.novelweb.modules.auth.session.SessionRepository;
import com.novelweb.modules.auth.session.SessionService;
import com.novelweb.modules.audit.AuditService;
import com.novelweb.modules.settings.SettingsRepository;
import com.novelweb.modules.users.UserRepository;
import com.novelweb.security.auth.SecurityUserDetails;
import com.novelweb.security.jwt.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final SessionService sessionService;
    private final SettingsRepository settingsRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = HttpRequestUtil.getClientIp(httpRequest);
        String userAgent = request.getUserAgent();
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getStatus() == UserStatus.BANNED) {
            auditService.log(AuditAction.LOGIN_FAIL, user.getId(), null, "{\"reason\":\"banned\"}", ipAddress, userAgent);
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is banned");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.log(AuditAction.LOGIN_FAIL, user.getId(), null, "{\"reason\":\"bad_password\"}", ipAddress, userAgent);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        SingleSessionPolicy policy = settingsRepository.findById((short) 1)
            .map(setting -> setting.getSingleSessionPolicy())
            .orElse(SingleSessionPolicy.KICK_OLD);

        sessionService.enforcePolicy(user, policy);

        String refreshToken = TokenUtil.generateToken();
        String refreshHash = TokenUtil.sha256(refreshToken);
        UserSession session = sessionService.createSession(
            user.getId(),
            refreshHash,
            request.getDeviceId(),
            userAgent,
            ipAddress
        );

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtProvider.generateAccessToken(user.getId(), session.getId(), user.getRole());
        auditService.log(AuditAction.LOGIN_SUCCESS, user.getId(), session.getId(), "{}", ipAddress, userAgent);
        return new LoginResponse(accessToken, refreshToken);
    }

    public LoginResponse refresh(RefreshRequest request) {
        String refreshHash = TokenUtil.sha256(request.getRefreshToken());
        UserSession session = sessionRepository
            .findBySessionTokenHashAndStatus(refreshHash, SessionStatus.ACTIVE)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        User user = userRepository.findById(session.getUserId())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid session"));

        String newRefresh = TokenUtil.generateToken();
        session.setSessionTokenHash(TokenUtil.sha256(newRefresh));
        sessionRepository.save(session);

        String accessToken = jwtProvider.generateAccessToken(user.getId(), session.getId(), user.getRole());
        return new LoginResponse(accessToken, newRefresh);
    }

    public void logout(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserDetails principal)) {
            return;
        }
        sessionRepository.findById(principal.getSessionId())
            .ifPresent(session -> {
                sessionService.revoke(session, "LOGOUT");
                auditService.log(AuditAction.LOGOUT, principal.getUserId(), session.getId(), "{}", null, null);
            });
    }
}
