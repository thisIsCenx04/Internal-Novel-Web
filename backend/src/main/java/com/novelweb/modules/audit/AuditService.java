package com.novelweb.modules.audit;

import com.novelweb.domain.entity.AuditLog;
import com.novelweb.domain.enums.AuditAction;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {
    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void log(AuditAction action, UUID userId, UUID sessionId, Map<String, Object> metadata, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUserId(userId);
        log.setSessionId(sessionId);
        log.setMetadata(metadata == null ? Collections.emptyMap() : metadata);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditRepository.save(log);
    }
}