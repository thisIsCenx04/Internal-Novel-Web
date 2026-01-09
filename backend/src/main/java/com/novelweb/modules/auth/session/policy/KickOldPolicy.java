package com.novelweb.modules.auth.session.policy;

import com.novelweb.domain.entity.User;
import com.novelweb.domain.enums.SessionStatus;
import com.novelweb.modules.auth.session.SessionRepository;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KickOldPolicy implements SingleSessionPolicy {
    private final SessionRepository sessionRepository;

    @Override
    public void apply(User user) {
        sessionRepository.findFirstByUserIdAndStatus(user.getId(), SessionStatus.ACTIVE)
            .ifPresent(session -> {
                session.setStatus(SessionStatus.REVOKED);
                session.setRevokedAt(OffsetDateTime.now());
                session.setRevokeReason("KICK_OLD");
                sessionRepository.save(session);
            });
    }
}
