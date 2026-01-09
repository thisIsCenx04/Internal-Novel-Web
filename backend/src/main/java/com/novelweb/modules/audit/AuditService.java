package com.novelweb.modules.audit;

import com.novelweb.domain.entity.AuditLog;
import com.novelweb.domain.enums.AuditAction;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;

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
}
