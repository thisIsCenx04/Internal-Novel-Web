package com.novelweb.modules.chapters.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChapterSummaryResponse {
    private final UUID id;
    private final Integer chapterNo;
    private final String title;
    private final Boolean isVisible;
    private final OffsetDateTime publishedAt;
}
