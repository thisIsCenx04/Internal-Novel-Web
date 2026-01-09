package com.novelweb.modules.settings;

import com.novelweb.domain.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepository extends JpaRepository<SiteSetting, Short> {
}
