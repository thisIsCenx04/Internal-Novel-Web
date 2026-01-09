package com.novelweb.modules.auth.session.policy;

import com.novelweb.domain.entity.User;

public interface SingleSessionPolicy {
    void apply(User user);
}
