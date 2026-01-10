package com.novelweb.modules.dashboard.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardTopStoryResponse {
    private final UUID storyId;
    private final String title;
    private final String slug;
    private final long views;
}
