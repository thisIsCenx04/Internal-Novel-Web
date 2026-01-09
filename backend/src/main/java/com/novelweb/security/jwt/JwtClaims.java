package com.novelweb.security.jwt;

import com.novelweb.domain.enums.UserRole;
import java.util.UUID;

public record JwtClaims(UUID userId, UUID sessionId, UserRole role) {}
