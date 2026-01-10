package com.novelweb.modules.users;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.users.dto.MemberProfileResponse;
import com.novelweb.security.auth.SecurityUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/profile")
@RequiredArgsConstructor
public class UserMemberController {
    private final UserService userService;

    @GetMapping
    public ApiResponse<MemberProfileResponse> profile(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserDetails principal) {
            return ApiResponse.ok(userService.getProfile(principal));
        }
        throw new IllegalStateException("No authenticated user");
    }
}
