package com.novelweb.modules.settings;

import com.novelweb.domain.entity.SiteSetting;
import com.novelweb.domain.enums.SingleSessionPolicy;
import com.novelweb.modules.settings.dto.SettingsResponse;
import com.novelweb.modules.settings.dto.SettingsUpdateRequest;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {
    private static final short SETTINGS_ID = 1;

    private final SettingsRepository settingsRepository;

    public SettingsResponse getSettings() {
        SiteSetting settings = getOrCreate();
        return toResponse(settings);
    }

    public SettingsResponse update(SettingsUpdateRequest request) {
        SiteSetting settings = getOrCreate();
        settings.setRulesBannerText(Optional.ofNullable(request.getRulesBannerText()).orElse(""));
        settings.setFooterContactText(Optional.ofNullable(request.getFooterContactText()).orElse(""));
        settings.setSingleSessionPolicy(request.getSingleSessionPolicy());
        return toResponse(settingsRepository.save(settings));
    }

    private SiteSetting getOrCreate() {
        return settingsRepository.findById(SETTINGS_ID).orElseGet(() -> {
            SiteSetting setting = new SiteSetting();
            setting.setId(SETTINGS_ID);
            setting.setRulesBannerText("");
            setting.setFooterContactText("");
            setting.setSingleSessionPolicy(SingleSessionPolicy.KICK_OLD);
            return settingsRepository.save(setting);
        });
    }

    private SettingsResponse toResponse(SiteSetting setting) {
        return new SettingsResponse(
            setting.getRulesBannerText(),
            setting.getFooterContactText(),
            setting.getSingleSessionPolicy()
        );
    }
}
