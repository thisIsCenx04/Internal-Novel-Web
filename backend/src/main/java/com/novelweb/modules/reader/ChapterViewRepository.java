package com.novelweb.modules.reader;

import com.novelweb.domain.entity.ChapterView;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChapterViewRepository extends JpaRepository<ChapterView, UUID> {
    @Query("""
        select cv.storyId as storyId, count(cv.id) as views
        from ChapterView cv
        where cv.storyId in :storyIds
        group by cv.storyId
        """)
    List<StoryViewCount> countViewsByStoryIds(@Param("storyIds") List<UUID> storyIds);

    interface StoryViewCount {
        UUID getStoryId();
        long getViews();
    }
}
