package com.novelweb.modules.dashboard;

import com.novelweb.modules.dashboard.dto.DashboardOverviewResponse;
import com.novelweb.modules.dashboard.dto.DashboardTimeSeriesPoint;
import com.novelweb.modules.dashboard.dto.DashboardTopStoryResponse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private static final int DAYS_WINDOW = 14;
    private static final int WEEKS_WINDOW = 12;
    private static final int MONTHS_WINDOW = 12;
    private static final int TOP_STORIES_LIMIT = 10;
    private static final int ACTIVE_MINUTES_WINDOW = 30;

    private final JdbcTemplate jdbcTemplate;

    public DashboardOverviewResponse getOverview() {
        long totalViews = count("select count(*) from chapter_views");
        long totalUsers = count("select count(*) from users");
        long totalStories = count("select count(*) from stories");
        long activeUsers = count(
            "select count(distinct user_id) from user_sessions " +
            "where status = 'ACTIVE' and last_seen_at >= now() - interval '" + ACTIVE_MINUTES_WINDOW + " minutes'"
        );

        List<DashboardTimeSeriesPoint> viewsByDay = loadTimeSeries("day", "YYYY-MM-DD", DAYS_WINDOW, "days");
        List<DashboardTimeSeriesPoint> viewsByWeek = loadTimeSeries("week", "IYYY-\"W\"IW", WEEKS_WINDOW, "weeks");
        List<DashboardTimeSeriesPoint> viewsByMonth = loadTimeSeries("month", "YYYY-MM", MONTHS_WINDOW, "months");
        List<DashboardTopStoryResponse> topStories = loadTopStories();

        return new DashboardOverviewResponse(
            totalViews,
            activeUsers,
            totalUsers,
            totalStories,
            viewsByDay,
            viewsByWeek,
            viewsByMonth,
            topStories
        );
    }

    private long count(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class);
        return value == null ? 0L : value;
    }

    private List<DashboardTimeSeriesPoint> loadTimeSeries(
        String bucket,
        String format,
        int window,
        String unit
    ) {
        String sql =
            "select to_char(date_trunc('" + bucket + "', opened_at), '" + format + "') as bucket, " +
            "count(*) as total " +
            "from chapter_views " +
            "where opened_at >= now() - interval '" + window + " " + unit + "' " +
            "group by 1 " +
            "order by 1";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapTimeSeries(rs));
    }

    private DashboardTimeSeriesPoint mapTimeSeries(ResultSet rs) throws SQLException {
        return new DashboardTimeSeriesPoint(rs.getString("bucket"), rs.getLong("total"));
    }

    private List<DashboardTopStoryResponse> loadTopStories() {
        String sql =
            "select s.id as story_id, s.title as title, s.slug as slug, count(cv.id) as views " +
            "from chapter_views cv " +
            "join stories s on s.id = cv.story_id " +
            "group by s.id, s.title, s.slug " +
            "order by views desc " +
            "limit " + TOP_STORIES_LIMIT;
        RowMapper<DashboardTopStoryResponse> mapper = (rs, rowNum) ->
            new DashboardTopStoryResponse(
                rs.getObject("story_id", java.util.UUID.class),
                rs.getString("title"),
                rs.getString("slug"),
                rs.getLong("views")
            );
        return jdbcTemplate.query(sql, mapper);
    }
}
