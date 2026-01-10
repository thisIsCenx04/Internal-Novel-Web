package com.novelweb.modules.reader;

import com.novelweb.common.exception.ApiException;
import com.novelweb.common.utils.HttpRequestUtil;
import com.novelweb.domain.entity.Chapter;
import com.novelweb.domain.entity.ChapterView;
import com.novelweb.domain.entity.ReadingChapterSession;
import com.novelweb.domain.enums.AuditAction;
import com.novelweb.modules.audit.AuditService;
import com.novelweb.modules.chapters.ChapterRepository;
import com.novelweb.modules.reader.dto.NextChapterResponse;
import com.novelweb.modules.reader.dto.OpenChapterResponse;
import com.novelweb.security.auth.SecurityUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReaderService {
    private static final int NEXT_DELAY_SECONDS = 10;
    private final ChapterRepository chapterRepository;
    private final ReadingChapterSessionRepository readingSessionRepository;
    private final ChapterViewRepository chapterViewRepository;
    private final AuditService auditService;

    public OpenChapterResponse openChapter(UUID chapterId, SecurityUserDetails principal, HttpServletRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chapter not found"));

        if (!Boolean.TRUE.equals(chapter.getIsVisible()) || !Boolean.TRUE.equals(chapter.getStory().getIsVisible())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Chapter not found");
        }

        OffsetDateTime now = OffsetDateTime.now();
        ReadingChapterSession session = new ReadingChapterSession();
        session.setUserId(principal.getUserId());
        session.setSessionId(principal.getSessionId());
        session.setChapterId(chapter.getId());
        session.setStoryId(chapter.getStory().getId());
        session.setOpenedAt(now);
        session.setAllowNextAt(now.plusSeconds(NEXT_DELAY_SECONDS));
        session.setNextAttemptsBeforeAllowed(0);
        readingSessionRepository.save(session);

        ChapterView view = new ChapterView();
        view.setUserId(principal.getUserId());
        view.setSessionId(principal.getSessionId());
        view.setChapterId(chapter.getId());
        view.setStoryId(chapter.getStory().getId());
        view.setOpenedAt(now);
        view.setIpAddress(HttpRequestUtil.getClientIp(request));
        view.setUserAgent(request.getHeader("User-Agent"));
        chapterViewRepository.save(view);

        auditService.log(
            AuditAction.OPEN_CHAPTER,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"storyId\":\"%s\",\"chapterId\":\"%s\"}", chapter.getStory().getId(), chapter.getId()),
            HttpRequestUtil.getClientIp(request),
            request.getHeader("User-Agent")
        );

        return new OpenChapterResponse(session.getId(), session.getAllowNextAt());
    }

    public NextChapterResponse requestNext(UUID sessionReadingId, SecurityUserDetails principal, HttpServletRequest request) {
        ReadingChapterSession session = readingSessionRepository.findById(sessionReadingId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reading session not found"));

        if (!session.getUserId().equals(principal.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(session.getAllowNextAt())) {
            int remaining = (int) Math.max(1, Duration.between(now, session.getAllowNextAt()).toSeconds());
            session.setNextAttemptsBeforeAllowed(session.getNextAttemptsBeforeAllowed() + 1);
            readingSessionRepository.save(session);
            auditService.log(
                AuditAction.NEXT_TOO_FAST,
                principal.getUserId(),
                principal.getSessionId(),
                String.format(
                    "{\"sessionId\":\"%s\",\"chapterId\":\"%s\",\"remainingSeconds\":%d}",
                    session.getId(),
                    session.getChapterId(),
                    remaining
                ),
                HttpRequestUtil.getClientIp(request),
                request.getHeader("User-Agent")
            );
            return new NextChapterResponse(false, remaining, session.getAllowNextAt());
        }

        session.setCompletedAt(now);
        readingSessionRepository.save(session);
        auditService.log(
            AuditAction.NEXT_CHAPTER,
            principal.getUserId(),
            principal.getSessionId(),
            String.format("{\"sessionId\":\"%s\",\"chapterId\":\"%s\"}", session.getId(), session.getChapterId()),
            HttpRequestUtil.getClientIp(request),
            request.getHeader("User-Agent")
        );
        return new NextChapterResponse(true, 0, session.getAllowNextAt());
    }
}
