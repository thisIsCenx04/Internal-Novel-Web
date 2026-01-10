package com.novelweb.modules.reader.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Getter;

@Getter
public class OpenChapterRequest {
    @NotNull
    private UUID chapterId;
}
