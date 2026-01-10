package com.novelweb.modules.chapters;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.chapters.dto.ChapterContentResponse;
import com.novelweb.modules.chapters.dto.ChapterCreateRequest;
import com.novelweb.modules.chapters.dto.ChapterSummaryResponse;
import com.novelweb.modules.chapters.dto.ChapterUpdateRequest;
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
@RequestMapping("/api/admin/stories/{storyId}/chapters")
@RequiredArgsConstructor
public class ChapterAdminController {
    private final ChapterService chapterService;

    @GetMapping
    public ApiResponse<List<ChapterSummaryResponse>> list(@PathVariable UUID storyId) {
        return ApiResponse.ok(chapterService.listForAdmin(storyId));
    }

    @GetMapping("/{chapterId}")
    public ApiResponse<ChapterContentResponse> detail(
        @PathVariable UUID storyId,
        @PathVariable UUID chapterId
    ) {
        return ApiResponse.ok(chapterService.getById(chapterId));
    }

    @PostMapping
    public ApiResponse<ChapterSummaryResponse> create(
        @PathVariable UUID storyId,
        @Valid @RequestBody ChapterCreateRequest request
    ) {
        return ApiResponse.ok(chapterService.create(storyId, request));
    }

    @PutMapping("/{chapterId}")
    public ApiResponse<ChapterSummaryResponse> update(
        @PathVariable UUID storyId,
        @PathVariable UUID chapterId,
        @Valid @RequestBody ChapterUpdateRequest request
    ) {
        return ApiResponse.ok(chapterService.update(storyId, chapterId, request));
    }

    @DeleteMapping("/{chapterId}")
    public ApiResponse<Void> delete(@PathVariable UUID storyId, @PathVariable UUID chapterId) {
        chapterService.delete(storyId, chapterId);
        return ApiResponse.okMessage("Deleted");
    }
}
