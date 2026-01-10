package com.novelweb.modules.reader.dto;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NextChapterResponse {
    private final boolean allowed;
    private final int remainingSeconds;
    private final OffsetDateTime allowNextAt;
}
