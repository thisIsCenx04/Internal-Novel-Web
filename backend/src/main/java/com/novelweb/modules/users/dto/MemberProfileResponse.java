package com.novelweb.modules.users.dto;

import com.novelweb.domain.enums.UserRole;
import com.novelweb.domain.enums.UserStatus;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberProfileResponse {
    private final UUID id;
    private final String username;
    private final UserRole role;
    private final UserStatus status;
    private final OffsetDateTime vipExpiresAt;
    private final Integer vipWarningDays;
    private final boolean vipExpired;
}
