package com.novelweb.modules.settings.dto;

import com.novelweb.domain.enums.SingleSessionPolicy;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SettingsUpdateRequest {
    private String rulesBannerText;
    private String footerContactText;

    @NotNull(message = "singleSessionPolicy is required")
    private SingleSessionPolicy singleSessionPolicy;
}
