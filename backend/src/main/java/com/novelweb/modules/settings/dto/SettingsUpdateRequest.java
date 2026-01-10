package com.novelweb.modules.settings.dto;

import com.novelweb.domain.enums.SingleSessionPolicy;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SettingsUpdateRequest {
    @Size(max = 1000, message = "Rules banner text must be at most 1000 characters")
    private String rulesBannerText;
    private String footerContactText;

    @NotNull(message = "singleSessionPolicy is required")
    private SingleSessionPolicy singleSessionPolicy;

    private Boolean watermarkEnabled;
}
