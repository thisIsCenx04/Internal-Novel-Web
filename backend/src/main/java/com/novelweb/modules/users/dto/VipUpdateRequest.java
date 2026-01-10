package com.novelweb.modules.users.dto;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VipUpdateRequest {
    private OffsetDateTime expiresAt;
    private Integer addDays;
    private String note;
}
