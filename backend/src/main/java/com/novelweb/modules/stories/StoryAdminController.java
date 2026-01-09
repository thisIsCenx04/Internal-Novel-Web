package com.novelweb.modules.stories;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.stories.dto.StoryCreateRequest;
import com.novelweb.modules.stories.dto.StoryDetailResponse;
import com.novelweb.modules.stories.dto.StorySummaryResponse;
import com.novelweb.modules.stories.dto.StoryUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stories")
@RequiredArgsConstructor
public class StoryAdminController {
    private final StoryService storyService;

    @GetMapping
    public ApiResponse<List<StorySummaryResponse>> list() {
        return ApiResponse.ok(storyService.adminList());
    }

    @GetMapping("/{id}")
    public ApiResponse<StoryDetailResponse> getById(@PathVariable UUID id) {
        return ApiResponse.ok(storyService.adminGetById(id));
    }

    @PostMapping
    public ApiResponse<StoryDetailResponse> create(@Valid @RequestBody StoryCreateRequest request) {
        return ApiResponse.ok(storyService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<StoryDetailResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody StoryUpdateRequest request
    ) {
        return ApiResponse.ok(storyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        storyService.delete(id);
        return ApiResponse.okMessage("Deleted");
    }
}
