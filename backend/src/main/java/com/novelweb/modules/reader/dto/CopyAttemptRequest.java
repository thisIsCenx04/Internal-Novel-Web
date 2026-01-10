package com.novelweb.modules.reader.dto;

import java.util.UUID;
import lombok.Getter;

@Getter
public class CopyAttemptRequest {
    private UUID storyId;
    private UUID chapterId;
}
