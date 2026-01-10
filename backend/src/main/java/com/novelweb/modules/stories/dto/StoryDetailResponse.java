package com.novelweb.modules.stories.dto;

import com.novelweb.modules.categories.dto.CategoryResponse;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StoryDetailResponse {
    private final UUID id;
    private final String title;
    private final String slug;
    private final String description;
    private final String coverUrl;
    private final Boolean isVisible;
    private final List<CategoryResponse> categories;
}
