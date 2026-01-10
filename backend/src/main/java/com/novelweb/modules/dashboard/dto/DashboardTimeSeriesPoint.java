package com.novelweb.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardTimeSeriesPoint {
    private final String bucket;
    private final long total;
}
