package com.novelweb.modules.audit;

import com.novelweb.common.response.PageResponse;
import com.novelweb.domain.entity.AuditLog;
import com.novelweb.domain.entity.User;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.modules.audit.dto.AuditLogResponse;
import com.novelweb.modules.users.UserRepository;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    private final UserRepository userRepository;

    public void log(AuditAction action, UUID userId, UUID sessionId, String metadata, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUserId(userId);
        log.setSessionId(sessionId);
        log.setMetadata(metadata);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        auditRepository.save(log);
    }

    public void log(AuditAction action, String metadata, String ipAddress, String userAgent) {
        log(action, null, null, metadata, ipAddress, userAgent);
    }

    public PageResponse<AuditLogResponse> list(
        UUID userId,
        AuditAction action,
        OffsetDateTime from,
        OffsetDateTime to,
        int page,
        int size
    ) {
        Specification<AuditLog> spec = (root, query, cb) -> cb.conjunction();
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        if (action != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), action));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        var pageable = PageRequest.of(
            page,
            size,
            Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
        var result = auditRepository.findAll(spec, pageable);
        Map<UUID, String> usernames = loadUsernames(result.getContent());

        List<AuditLogResponse> items = result.getContent().stream()
            .map(log -> new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                usernames.get(log.getUserId()),
                log.getSessionId(),
                log.getAction(),
                log.getMetadata(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getCreatedAt()
            ))
            .toList();

        return new PageResponse<>(items, result.getTotalElements(), page, size);
    }

    private Map<UUID, String> loadUsernames(List<AuditLog> logs) {
        List<UUID> userIds = logs.stream()
            .map(AuditLog::getUserId)
            .filter(id -> id != null)
            .distinct()
            .collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return new HashMap<>();
        }

        Map<UUID, String> usernames = new HashMap<>();
        for (User user : userRepository.findAllById(userIds)) {
            usernames.put(user.getId(), user.getUsername());
        }
        return usernames;
    }
}
