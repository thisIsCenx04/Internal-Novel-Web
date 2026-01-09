package com.novelweb.modules.settings.dto;

import com.novelweb.domain.enums.SingleSessionPolicy;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SettingsResponse {
    private final String rulesBannerText;
    private final String footerContactText;
    private final SingleSessionPolicy singleSessionPolicy;
}
