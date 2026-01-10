package com.novelweb.modules.reader;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.reader.dto.NextChapterRequest;
import com.novelweb.modules.reader.dto.NextChapterResponse;
import com.novelweb.modules.reader.dto.OpenChapterRequest;
import com.novelweb.modules.reader.dto.OpenChapterResponse;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/reader")
@RequiredArgsConstructor
public class ReaderController {
    private final ReaderService readerService;

    @PostMapping("/open")
    public ApiResponse<OpenChapterResponse> open(
        @Valid @RequestBody OpenChapterRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        SecurityUserDetails principal = requirePrincipal(authentication);
        return ApiResponse.ok(readerService.openChapter(request.getChapterId(), principal, httpRequest));
    }

    @PostMapping("/next")
    public ResponseEntity<ApiResponse<NextChapterResponse>> next(
        @Valid @RequestBody NextChapterRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        SecurityUserDetails principal = requirePrincipal(authentication);
        NextChapterResponse response = readerService.requestNext(
            request.getSessionReadingId(),
            principal,
            httpRequest
        );
        if (!response.isAllowed()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error("Too fast", response));
        }
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private SecurityUserDetails requirePrincipal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserDetails principal) {
            return principal;
        }
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
}
