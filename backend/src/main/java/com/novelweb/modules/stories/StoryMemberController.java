package com.novelweb.modules.stories;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.stories.dto.StoryDetailResponse;
import com.novelweb.modules.stories.dto.StorySummaryResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/stories")
@RequiredArgsConstructor
public class StoryMemberController {
    private final StoryService storyService;

    @GetMapping
    public ApiResponse<List<StorySummaryResponse>> newest() {
        return ApiResponse.ok(storyService.getNewest(15));
    }

    @GetMapping("/{slug}")
    public ApiResponse<StoryDetailResponse> detail(@PathVariable String slug) {
        return ApiResponse.ok(storyService.getVisibleBySlug(slug));
    }
}
