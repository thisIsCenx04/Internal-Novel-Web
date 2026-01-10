package com.novelweb.modules.reader;

import com.novelweb.domain.entity.ReadingChapterSession;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadingChapterSessionRepository extends JpaRepository<ReadingChapterSession, UUID> {}
