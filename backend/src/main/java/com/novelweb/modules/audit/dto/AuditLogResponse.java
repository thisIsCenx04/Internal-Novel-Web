package com.novelweb.modules.audit.dto;

import com.novelweb.domain.enums.AuditAction;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuditLogResponse {
    private final UUID id;
    private final UUID userId;
    private final String username;
    private final UUID sessionId;
    private final AuditAction action;
    private final String metadata;
    private final String ipAddress;
    private final String userAgent;
    private final OffsetDateTime createdAt;
}
