package com.novelweb.modules.audit;

import com.novelweb.domain.entity.AuditLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRepository extends JpaRepository<AuditLog, UUID> {
}
