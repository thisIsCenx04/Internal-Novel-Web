package com.novelweb.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "reading_chapter_sessions")
@Getter
@Setter
@NoArgsConstructor
public class ReadingChapterSession {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "chapter_id", nullable = false)
    private UUID chapterId;

    @Column(name = "story_id", nullable = false)
    private UUID storyId;

    @Column(name = "opened_at", nullable = false)
    private OffsetDateTime openedAt;

    @Column(name = "allow_next_at", nullable = false)
    private OffsetDateTime allowNextAt;

    @Column(name = "next_attempts_before_allowed", nullable = false)
    private Integer nextAttemptsBeforeAllowed = 0;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (openedAt == null) {
            openedAt = OffsetDateTime.now();
        }
        if (nextAttemptsBeforeAllowed == null) {
            nextAttemptsBeforeAllowed = 0;
        }
    }
}
