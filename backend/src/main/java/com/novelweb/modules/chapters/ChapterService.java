package com.novelweb.modules.chapters;

import com.novelweb.common.exception.ApiException;
import com.novelweb.domain.entity.Chapter;
import com.novelweb.domain.entity.Story;
import com.novelweb.modules.chapters.dto.ChapterContentResponse;
import com.novelweb.modules.chapters.dto.ChapterCreateRequest;
import com.novelweb.modules.chapters.dto.ChapterSummaryResponse;
import com.novelweb.modules.chapters.dto.ChapterUpdateRequest;
import com.novelweb.modules.stories.StoryRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChapterService {
    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;

    public List<ChapterSummaryResponse> listForAdmin(UUID storyId) {
        return chapterRepository.findByStoryIdOrderByChapterNoAsc(storyId)
            .stream()
            .map(this::toSummary)
            .toList();
    }

    public List<ChapterSummaryResponse> listVisible(UUID storyId) {
        return chapterRepository.findByStoryIdAndIsVisibleTrueOrderByChapterNoAsc(storyId)
            .stream()
            .map(this::toSummary)
            .toList();
    }

    public ChapterContentResponse getVisibleById(UUID chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .filter(Chapter::getIsVisible)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));
        return toContent(chapter);
    }

    public ChapterContentResponse getById(UUID chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));
        return toContent(chapter);
    }

    public ChapterContentResponse getVisibleByStoryAndNo(UUID storyId, Integer chapterNo) {
        Chapter chapter = chapterRepository.findByStoryIdAndChapterNoAndIsVisibleTrue(storyId, chapterNo)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));
        return toContent(chapter);
    }

    public ChapterSummaryResponse create(UUID storyId, ChapterCreateRequest request) {
        Story story = storyRepository.findById(storyId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Story not found"));
        Chapter chapter = new Chapter();
        chapter.setStory(story);
        applyRequest(chapter, request.getChapterNo(), request.getTitle(), request.getContent(),
            request.getIsVisible(), request.getPublishedAt());
        Chapter saved = chapterRepository.save(chapter);
        refreshLatestPublishedAt(story);
        return toSummary(saved);
    }

    public ChapterSummaryResponse update(UUID storyId, UUID chapterId, ChapterUpdateRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));
        if (!chapter.getStory().getId().equals(storyId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chapter does not belong to story");
        }
        applyRequest(chapter, request.getChapterNo(), request.getTitle(), request.getContent(),
            request.getIsVisible(), request.getPublishedAt());
        Chapter saved = chapterRepository.save(chapter);
        refreshLatestPublishedAt(chapter.getStory());
        return toSummary(saved);
    }

    public void delete(UUID storyId, UUID chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));
        if (!chapter.getStory().getId().equals(storyId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chapter does not belong to story");
        }
        chapterRepository.delete(chapter);
        refreshLatestPublishedAt(chapter.getStory());
    }

    private void applyRequest(
        Chapter chapter,
        Integer chapterNo,
        String title,
        String content,
        Boolean isVisible,
        OffsetDateTime publishedAt
    ) {
        chapter.setChapterNo(chapterNo);
        chapter.setTitle(title != null && !title.isBlank() ? title.trim() : null);
        chapter.setContent(content);
        chapter.setIsVisible(isVisible != null ? isVisible : true);
        chapter.setPublishedAt(publishedAt != null ? publishedAt : OffsetDateTime.now());
    }

    private void refreshLatestPublishedAt(Story story) {
        OffsetDateTime latest = chapterRepository.findLatestPublishedAt(story.getId()).orElse(null);
        story.setLatestChapterPublishedAt(latest);
        storyRepository.save(story);
    }

    private ChapterSummaryResponse toSummary(Chapter chapter) {
        return new ChapterSummaryResponse(
            chapter.getId(),
            chapter.getChapterNo(),
            chapter.getTitle(),
            chapter.getIsVisible(),
            chapter.getPublishedAt()
        );
    }

    private ChapterContentResponse toContent(Chapter chapter) {
        return new ChapterContentResponse(
            chapter.getId(),
            chapter.getStory().getId(),
            chapter.getChapterNo(),
            chapter.getTitle(),
            chapter.getContent(),
            chapter.getIsVisible(),
            chapter.getPublishedAt()
        );
    }
}
