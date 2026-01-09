package com.novelweb.modules.settings;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.modules.audit.AuditService;
import com.novelweb.modules.settings.dto.SettingsResponse;
import com.novelweb.modules.settings.dto.SettingsUpdateRequest;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SettingsAdminController {
    private final SettingsService settingsService;
    private final AuditService auditService;

    @GetMapping
    public ApiResponse<SettingsResponse> getSettings() {
        return ApiResponse.ok(settingsService.getSettings());
    }

    @PutMapping
    public ApiResponse<SettingsResponse> update(
        @Valid @RequestBody SettingsUpdateRequest request,
        Authentication authentication
    ) {
        SettingsResponse response = settingsService.update(request);
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserDetails principal) {
            UUID userId = principal.getUserId();
            UUID sessionId = principal.getSessionId();
            auditService.log(AuditAction.UPDATE_SETTINGS, userId, sessionId, "{}", null, null);
        }
        return ApiResponse.ok(response);
    }
}
