package com.novelweb.modules.auth.session.policy;

import com.novelweb.common.exception.ApiException;
import com.novelweb.domain.entity.User;
import com.novelweb.domain.enums.SessionStatus;
import com.novelweb.modules.auth.session.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DenyNewPolicy implements SingleSessionPolicy {
    private final SessionRepository sessionRepository;

    @Override
    public void apply(User user) {
        boolean hasActive = sessionRepository
            .findFirstByUserIdAndStatus(user.getId(), SessionStatus.ACTIVE)
            .isPresent();
        if (hasActive) {
            throw new ApiException(HttpStatus.CONFLICT, "Account already has an active session.");
        }
    }
}
