package com.novelweb.modules.stories.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StoryCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String coverUrl;
    private Boolean isVisible = true;
}
