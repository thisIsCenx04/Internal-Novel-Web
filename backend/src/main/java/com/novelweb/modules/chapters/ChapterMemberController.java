package com.novelweb.modules.chapters;

import com.novelweb.common.response.ApiResponse;
import com.novelweb.modules.chapters.dto.ChapterContentResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member/chapters")
@RequiredArgsConstructor
public class ChapterMemberController {
    private final ChapterService chapterService;

    @GetMapping("/{chapterId}")
    public ApiResponse<ChapterContentResponse> getById(@PathVariable UUID chapterId) {
        return ApiResponse.ok(chapterService.getVisibleById(chapterId));
    }
}
