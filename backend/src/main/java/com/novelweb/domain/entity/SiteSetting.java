package com.novelweb.domain.entity;

import com.novelweb.domain.enums.SingleSessionPolicy;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "site_settings")
@Getter
@NoArgsConstructor
public class SiteSetting {
    @Id
    private Short id;

    @Column(name = "rules_banner_text")
    private String rulesBannerText;

    @Column(name = "footer_contact_text")
    private String footerContactText;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "single_session_policy", nullable = false, columnDefinition = "setting_single_session_policy")
    private SingleSessionPolicy singleSessionPolicy = SingleSessionPolicy.KICK_OLD;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
