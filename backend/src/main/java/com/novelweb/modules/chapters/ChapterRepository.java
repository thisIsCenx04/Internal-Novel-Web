package com.novelweb.modules.chapters;

import com.novelweb.domain.entity.Chapter;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findByStoryIdOrderByChapterNoAsc(UUID storyId);

    List<Chapter> findByStoryIdAndIsVisibleTrueOrderByChapterNoAsc(UUID storyId);

    Optional<Chapter> findByStoryIdAndChapterNoAndIsVisibleTrue(UUID storyId, Integer chapterNo);

    @Query("""
        select max(c.publishedAt) from Chapter c
        where c.story.id = :storyId and c.isVisible = true
        """)
    Optional<OffsetDateTime> findLatestPublishedAt(UUID storyId);
}
