package com.novelweb.modules.audit;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.common.response.PageResponse;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.modules.audit.dto.AuditLogResponse;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AuditAdminController {
    private final AuditService auditService;

    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponse>> list(
        @RequestParam(required = false) UUID userId,
        @RequestParam(required = false) AuditAction action,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        return ApiResponse.ok(auditService.list(userId, action, from, to, page, size));
    }
}
