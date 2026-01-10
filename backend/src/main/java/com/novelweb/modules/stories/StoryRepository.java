package com.novelweb.modules.stories;

import com.novelweb.domain.entity.Story;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, UUID> {
    boolean existsBySlug(String slug);
    @EntityGraph(attributePaths = "categories")
    Optional<Story> findBySlug(String slug);

    @EntityGraph(attributePaths = "categories")
    Optional<Story> findBySlugAndIsVisibleTrue(String slug);

    @EntityGraph(attributePaths = "categories")
    @Query("""
        select s from Story s
        where s.isVisible = true
        order by s.latestChapterPublishedAt desc nulls last, s.createdAt desc
        """)
    List<Story> findVisible(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "categories")
    List<Story> findAll();

    @Override
    @EntityGraph(attributePaths = "categories")
    Optional<Story> findById(UUID id);
}
