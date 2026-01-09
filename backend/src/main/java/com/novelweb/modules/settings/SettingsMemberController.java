package com.novelweb.modules.settings;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.settings.dto.SettingsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/settings")
@RequiredArgsConstructor
public class SettingsMemberController {
    private final SettingsService settingsService;

    @GetMapping
    public ApiResponse<SettingsResponse> getSettings() {
        return ApiResponse.ok(settingsService.getSettings());
    }
}
