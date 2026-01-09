package com.novelweb.modules.auth.session;

import com.novelweb.domain.entity.UserSession;
import com.novelweb.domain.enums.SessionStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findFirstByUserIdAndStatus(UUID userId, SessionStatus status);
    Optional<UserSession> findBySessionTokenHashAndStatus(String sessionTokenHash, SessionStatus status);
}
