package com.novelweb.modules.reader;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.response.ApiResponse;
import com.novelweb.common.utils.HttpRequestUtil;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.modules.audit.AuditService;
import com.novelweb.modules.reader.dto.CopyAttemptRequest;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/audit")
@RequiredArgsConstructor
public class ReaderAuditController {
    private final AuditService auditService;

    @PostMapping("/copy-attempt")
    public ApiResponse<Void> copyAttempt(
        @RequestBody CopyAttemptRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserDetails principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        String metadata = String.format(
            "{\"storyId\":%s,\"chapterId\":%s}",
            request.getStoryId() == null ? "null" : "\"" + request.getStoryId() + "\"",
            request.getChapterId() == null ? "null" : "\"" + request.getChapterId() + "\""
        );
        auditService.log(
            AuditAction.COPY_ATTEMPT,
            principal.getUserId(),
            principal.getSessionId(),
            metadata,
            HttpRequestUtil.getClientIp(httpRequest),
            httpRequest.getHeader("User-Agent")
        );
        return ApiResponse.okMessage("Logged");
    }
}
