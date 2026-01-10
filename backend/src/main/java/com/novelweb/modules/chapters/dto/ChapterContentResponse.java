package com.novelweb.modules.chapters.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChapterContentResponse {
    private final UUID id;
    private final UUID storyId;
    private final Integer chapterNo;
    private final String title;
    private final String content;
    private final Boolean isVisible;
    private final OffsetDateTime publishedAt;
}
