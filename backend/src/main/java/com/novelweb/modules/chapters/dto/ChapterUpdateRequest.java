package com.novelweb.modules.chapters.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;
import lombok.Getter;

@Getter
public class ChapterUpdateRequest {
    @NotNull
    @Positive
    private Integer chapterNo;

    private String title;

    @NotBlank
    private String content;

    private Boolean isVisible;

    private OffsetDateTime publishedAt;
}
