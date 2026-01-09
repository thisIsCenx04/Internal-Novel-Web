package com.novelweb.modules.auth.session;

import com.novelweb.domain.entity.User;
import com.novelweb.domain.entity.UserSession;
import com.novelweb.domain.enums.SingleSessionPolicy;
import com.novelweb.modules.auth.session.policy.DenyNewPolicy;
import com.novelweb.modules.auth.session.policy.KickOldPolicy;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
    private final KickOldPolicy kickOldPolicy;
    private final DenyNewPolicy denyNewPolicy;

    public void enforcePolicy(User user, SingleSessionPolicy policy) {
        if (policy == SingleSessionPolicy.DENY_NEW) {
            denyNewPolicy.apply(user);
        } else {
            kickOldPolicy.apply(user);
        }
    }

    public UserSession createSession(UUID userId, String tokenHash, String deviceId, String userAgent, String ipAddress) {
        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setSessionTokenHash(tokenHash);
        session.setDeviceId(deviceId);
        session.setUserAgent(userAgent);
        session.setIpAddress(ipAddress);
        session.setLastSeenAt(OffsetDateTime.now());
        return sessionRepository.save(session);
    }

    public void revoke(UserSession session, String reason) {
        session.setStatus(com.novelweb.domain.enums.SessionStatus.REVOKED);
        session.setRevokedAt(OffsetDateTime.now());
        session.setRevokeReason(reason);
        sessionRepository.save(session);
    }
}
