package com.novelweb.modules.stories;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.utils.SlugUtil;
import com.novelweb.domain.entity.Category;
import com.novelweb.domain.entity.Story;
import com.novelweb.modules.chapters.ChapterRepository;
import com.novelweb.modules.chapters.dto.ChapterSummaryResponse;
import com.novelweb.modules.categories.CategoryRepository;
import com.novelweb.modules.categories.dto.CategoryResponse;
import com.novelweb.modules.stories.dto.StoryCreateRequest;
import com.novelweb.modules.stories.dto.StoryDetailResponse;
import com.novelweb.modules.stories.dto.StoryDetailWithChaptersResponse;
import com.novelweb.modules.stories.dto.StorySummaryResponse;
import com.novelweb.modules.stories.dto.StoryUpdateRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final CategoryRepository categoryRepository;

    public List<StorySummaryResponse> getNewest(int limit) {
        return storyRepository.findVisible(PageRequest.of(0, limit))
            .stream()
            .map(this::toSummary)
            .toList();
    }

    public StoryDetailResponse getVisibleBySlug(String slug) {
        Story story = storyRepository.findBySlugAndIsVisibleTrue(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Story not found"));
        return toDetail(story);
    }

    public StoryDetailWithChaptersResponse getVisibleWithChapters(String slug) {
        Story story = storyRepository.findBySlugAndIsVisibleTrue(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Story not found"));
        List<ChapterSummaryResponse> chapters = chapterRepository
            .findByStoryIdAndIsVisibleTrueOrderByChapterNoAsc(story.getId())
            .stream()
            .map(chapter -> new ChapterSummaryResponse(
                chapter.getId(),
                chapter.getChapterNo(),
                chapter.getTitle(),
                chapter.getIsVisible(),
                chapter.getPublishedAt()
            ))
            .toList();
        return new StoryDetailWithChaptersResponse(
            story.getId(),
            story.getTitle(),
            story.getSlug(),
            story.getDescription(),
            story.getCoverUrl(),
            toCategories(story),
            chapters
        );
    }

    public List<StorySummaryResponse> adminList() {
        return storyRepository.findAll()
            .stream()
            .map(this::toSummary)
            .toList();
    }

    public StoryDetailResponse adminGetById(UUID id) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Story not found"));
        return toDetail(story);
    }

    public StoryDetailResponse create(StoryCreateRequest request) {
        Story story = new Story();
        applyRequest(
            story,
            request.getTitle(),
            request.getDescription(),
            request.getCoverUrl(),
            request.getIsVisible(),
            request.getCategoryIds()
        );
        story.setSlug(generateUniqueSlug(request.getTitle()));
        return toDetail(storyRepository.save(story));
    }

    public StoryDetailResponse update(UUID id, StoryUpdateRequest request) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Story not found"));
        applyRequest(
            story,
            request.getTitle(),
            request.getDescription(),
            request.getCoverUrl(),
            request.getIsVisible(),
            request.getCategoryIds()
        );
        story.setSlug(generateUniqueSlug(request.getTitle(), story.getId()));
        return toDetail(storyRepository.save(story));
    }

    public void delete(UUID id) {
        if (!storyRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Story not found");
        }
        storyRepository.deleteById(id);
    }

    private void applyRequest(
        Story story,
        String title,
        String description,
        String coverUrl,
        Boolean isVisible,
        List<UUID> categoryIds
    ) {
        story.setTitle(title.trim());
        story.setDescription(description);
        story.setCoverUrl(coverUrl);
        story.setIsVisible(isVisible != null ? isVisible : true);
        if (categoryIds != null) {
            List<Category> categories = categoryRepository.findAllById(categoryIds);
            if (categories.size() != categoryIds.size()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid category");
            }
            story.getCategories().clear();
            story.getCategories().addAll(categories);
        }
    }

    private StorySummaryResponse toSummary(Story story) {
        return new StorySummaryResponse(
            story.getId(),
            story.getTitle(),
            story.getSlug(),
            story.getDescription(),
            story.getCoverUrl(),
            story.getIsVisible(),
            toCategories(story)
        );
    }

    private StoryDetailResponse toDetail(Story story) {
        return new StoryDetailResponse(
            story.getId(),
            story.getTitle(),
            story.getSlug(),
            story.getDescription(),
            story.getCoverUrl(),
            story.getIsVisible(),
            toCategories(story)
        );
    }

    private List<CategoryResponse> toCategories(Story story) {
        return story.getCategories()
            .stream()
            .map(category -> new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug()
            ))
            .toList();
    }

    private String generateUniqueSlug(String title) {
        return generateUniqueSlug(title, null);
    }

    private String generateUniqueSlug(String title, UUID currentId) {
        String base = SlugUtil.toSlug(title);
        String slug = base.isBlank() ? "story" : base;
        if (!isSlugTaken(slug, currentId)) {
            return slug;
        }
        int counter = 2;
        while (true) {
            String candidate = slug + "-" + counter;
            if (!isSlugTaken(candidate, currentId)) {
                return candidate;
            }
            counter++;
        }
    }

    private boolean isSlugTaken(String slug, UUID currentId) {
        return storyRepository.findBySlug(slug)
            .map(found -> currentId == null || !found.getId().equals(currentId))
            .orElse(false);
    }
}
