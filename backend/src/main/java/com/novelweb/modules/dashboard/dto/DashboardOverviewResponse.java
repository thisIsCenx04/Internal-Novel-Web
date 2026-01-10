package com.novelweb.modules.dashboard.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardOverviewResponse {
    private final long totalViews;
    private final long activeUsers;
    private final long totalUsers;
    private final long totalStories;
    private final List<DashboardTimeSeriesPoint> viewsByDay;
    private final List<DashboardTimeSeriesPoint> viewsByWeek;
    private final List<DashboardTimeSeriesPoint> viewsByMonth;
    private final List<DashboardTopStoryResponse> topStories;
}
