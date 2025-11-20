package com.lastnyam.owner.external.ocr.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class ClovaApiConfig {

    @Value("${clova.api.base-url}")
    private String baseUrl;

    @Value("${clova.api.secret-key}")
    private String secretKey;
}
