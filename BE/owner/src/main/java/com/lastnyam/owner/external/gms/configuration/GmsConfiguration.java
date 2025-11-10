package com.lastnyam.owner.external.gms.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class GmsConfiguration {
    @Value("gms.url")
    private String gmsUrl;
    @Value("gms.api-key")
    private String apiKey;

}
