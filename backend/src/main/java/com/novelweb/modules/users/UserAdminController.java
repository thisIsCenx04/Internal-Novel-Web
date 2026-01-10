package com.novelweb.modules.users;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.users.dto.UserCreateRequest;
import com.novelweb.modules.users.dto.UserResponse;
import com.novelweb.modules.users.dto.UserUpdateRequest;
import com.novelweb.modules.users.dto.VipUpdateRequest;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {
    private final UserService userService;

    @GetMapping
    public ApiResponse<List<UserResponse>> listUsers() {
        return ApiResponse.ok(userService.listUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUser(@PathVariable UUID id) {
        return ApiResponse.ok(userService.getUser(id));
    }

    @PostMapping
    public ApiResponse<UserResponse> createUser(
        @Valid @RequestBody UserCreateRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        return ApiResponse.ok(userService.createUser(request, requirePrincipal(authentication), httpRequest));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(
        @PathVariable UUID id,
        @RequestBody UserUpdateRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        return ApiResponse.ok(userService.updateUser(id, request, requirePrincipal(authentication), httpRequest));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(
        @PathVariable UUID id,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        userService.deleteUser(id, requirePrincipal(authentication), httpRequest);
        return ApiResponse.okMessage("Deleted");
    }

    @PostMapping("/{id}/ban")
    public ApiResponse<UserResponse> banUser(
        @PathVariable UUID id,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        return ApiResponse.ok(userService.banUser(id, requirePrincipal(authentication), httpRequest));
    }

    @PostMapping("/{id}/unban")
    public ApiResponse<UserResponse> unbanUser(
        @PathVariable UUID id,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        return ApiResponse.ok(userService.unbanUser(id, requirePrincipal(authentication), httpRequest));
    }

    @PostMapping("/{id}/vip")
    public ApiResponse<UserResponse> updateVip(
        @PathVariable UUID id,
        @RequestBody VipUpdateRequest request,
        Authentication authentication,
        HttpServletRequest httpRequest
    ) {
        return ApiResponse.ok(userService.updateVip(id, request, requirePrincipal(authentication), httpRequest));
    }

    private SecurityUserDetails requirePrincipal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserDetails principal) {
            return principal;
        }
        throw new IllegalStateException("No authenticated user");
    }
}
