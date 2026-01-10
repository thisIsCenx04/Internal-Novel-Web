package com.novelweb.modules.users.dto;

import com.novelweb.domain.enums.UserRole;
import com.novelweb.domain.enums.UserStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {
    private String username;
    private String password;
    private UserRole role;
    private UserStatus status;
}
