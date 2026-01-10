package com.novelweb.modules.stories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StoryUpdateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 250, message = "Description must be at most 250 characters")
    private String description;
    private String coverUrl;
    private Boolean isVisible = true;
    private List<UUID> categoryIds;
}
