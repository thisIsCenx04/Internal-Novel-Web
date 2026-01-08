package com.novelweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class NovelWebInternalApplication {

	public static void main(String[] args) {
		SpringApplication.run(NovelWebInternalApplication.class, args);
	}

}
