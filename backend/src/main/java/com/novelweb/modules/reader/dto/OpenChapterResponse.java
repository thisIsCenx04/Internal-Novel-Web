package com.novelweb.modules.reader.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OpenChapterResponse {
    private final UUID sessionReadingId;
    private final OffsetDateTime allowNextAt;
}
