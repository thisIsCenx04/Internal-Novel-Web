package com.novelweb.modules.audit;

import com.novelweb.domain.entity.AuditLog;
import com.novelweb.domain.enums.AuditAction;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void log(AuditAction action, String metadata, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setMetadata(metadata);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        auditRepository.save(log);
    }
}
