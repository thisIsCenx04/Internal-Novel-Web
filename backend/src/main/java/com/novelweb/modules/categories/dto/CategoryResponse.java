package com.novelweb.modules.categories.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoryResponse {
    private final UUID id;
    private final String name;
    private final String slug;
}
