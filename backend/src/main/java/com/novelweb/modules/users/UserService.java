package com.novelweb.modules.users;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.utils.HttpRequestUtil;
import com.novelweb.domain.entity.User;
import com.novelweb.domain.entity.UserSession;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.domain.enums.SessionStatus;
import com.novelweb.domain.enums.UserRole;
import com.novelweb.domain.enums.UserStatus;
import com.novelweb.modules.audit.AuditService;
import com.novelweb.modules.auth.session.SessionRepository;
import com.novelweb.modules.users.dto.MemberProfileResponse;
import com.novelweb.modules.users.dto.UserCreateRequest;
import com.novelweb.modules.users.dto.UserResponse;
import com.novelweb.modules.users.dto.UserUpdateRequest;
import com.novelweb.modules.users.dto.VipUpdateRequest;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public UserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    public UserResponse createUser(
        UserCreateRequest request,
        SecurityUserDetails principal,
        HttpServletRequest httpRequest
    ) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.MEMBER);
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        auditService.log(
            AuditAction.CREATE_USER,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"userId\":\"%s\"}", saved.getId()),
            HttpRequestUtil.getClientIp(httpRequest),
            httpRequest.getHeader("User-Agent")
        );
        return toResponse(saved);
    }

    public UserResponse updateUser(
        UUID userId,
        UserUpdateRequest request,
        SecurityUserDetails principal,
        HttpServletRequest httpRequest
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            updateStatus(user, request.getStatus(), principal, httpRequest);
        }
        User saved = userRepository.save(user);
        auditService.log(
            AuditAction.UPDATE_USER,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"userId\":\"%s\"}", saved.getId()),
            HttpRequestUtil.getClientIp(httpRequest),
            httpRequest.getHeader("User-Agent")
        );
        return toResponse(saved);
    }

    public void deleteUser(UUID userId, SecurityUserDetails principal, HttpServletRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        revokeSessions(user.getId(), "DELETED");
        userRepository.delete(user);
        auditService.log(
            AuditAction.DELETE_USER,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"userId\":\"%s\"}", userId),
            HttpRequestUtil.getClientIp(request),
            request.getHeader("User-Agent")
        );
    }

    public UserResponse banUser(UUID userId, SecurityUserDetails principal, HttpServletRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        updateStatus(user, UserStatus.BANNED, principal, request);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse unbanUser(UUID userId, SecurityUserDetails principal, HttpServletRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        updateStatus(user, UserStatus.ACTIVE, principal, request);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse updateVip(
        UUID userId,
        VipUpdateRequest request,
        SecurityUserDetails principal,
        HttpServletRequest httpRequest
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime nextExpiry = request.getExpiresAt();
        if (request.getAddDays() != null) {
            OffsetDateTime base = Optional.ofNullable(user.getVipExpiresAt()).orElse(now);
            nextExpiry = base.plusDays(request.getAddDays());
        }
        user.setVipExpiresAt(nextExpiry);
        if (request.getNote() != null) {
            user.setVipNote(request.getNote());
        }
        User saved = userRepository.save(user);
        auditService.log(
            AuditAction.UPDATE_VIP,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"userId\":\"%s\",\"vipExpiresAt\":\"%s\"}", saved.getId(), saved.getVipExpiresAt()),
            HttpRequestUtil.getClientIp(httpRequest),
            httpRequest.getHeader("User-Agent")
        );
        return toResponse(saved);
    }

    public MemberProfileResponse getProfile(SecurityUserDetails principal) {
        User user = userRepository.findById(principal.getUserId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime vipExpiresAt = user.getVipExpiresAt();
        boolean vipExpired = vipExpiresAt == null || vipExpiresAt.isBefore(now);
        Integer warningDays = null;
        if (!vipExpired) {
            long days = ChronoUnit.DAYS.between(now.toLocalDate(), vipExpiresAt.toLocalDate());
            if (days <= 3) {
                warningDays = (int) Math.max(0, days);
            }
        }
        return new MemberProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getRole(),
            user.getStatus(),
            vipExpiresAt,
            warningDays,
            vipExpired
        );
    }

    private void updateStatus(
        User user,
        UserStatus status,
        SecurityUserDetails principal,
        HttpServletRequest request
    ) {
        if (user.getStatus() == status) {
            return;
        }
        if (status == UserStatus.BANNED && user.getId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot ban your own account");
        }
        user.setStatus(status);
        if (status == UserStatus.BANNED) {
            revokeSessions(user.getId(), "BANNED");
            auditService.log(
                AuditAction.BAN_USER,
                principal.getUserId(),
                principal.getSessionId(),
                String.format("{\"userId\":\"%s\"}", user.getId()),
                HttpRequestUtil.getClientIp(request),
                request.getHeader("User-Agent")
            );
        } else if (status == UserStatus.ACTIVE) {
            auditService.log(
                AuditAction.UNBAN_USER,
                principal.getUserId(),
                principal.getSessionId(),
                String.format("{\"userId\":\"%s\"}", user.getId()),
                HttpRequestUtil.getClientIp(request),
                request.getHeader("User-Agent")
            );
        }
    }

    private void revokeSessions(UUID userId, String reason) {
        List<UserSession> sessions = sessionRepository.findAllByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        for (UserSession session : sessions) {
            session.setStatus(SessionStatus.REVOKED);
            session.setRevokedAt(OffsetDateTime.now());
            session.setRevokeReason(reason);
        }
        sessionRepository.saveAll(sessions);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getRole(),
            user.getStatus(),
            user.getVipExpiresAt(),
            user.getVipNote(),
            user.getCreatedAt(),
            user.getLastLoginAt()
        );
    }
}
