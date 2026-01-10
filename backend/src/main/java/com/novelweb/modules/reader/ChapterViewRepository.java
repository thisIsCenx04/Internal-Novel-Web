package com.novelweb.modules.reader;

import com.novelweb.domain.entity.ChapterView;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChapterViewRepository extends JpaRepository<ChapterView, UUID> {}
