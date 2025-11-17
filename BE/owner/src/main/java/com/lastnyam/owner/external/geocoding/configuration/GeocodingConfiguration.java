package com.lastnyam.owner.external.geocoding.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class GeocodingConfiguration {
    
    @Value("${geocoding.api-key}")
    private String apiKey;
    
    @Value("${geocoding.url}")
    private String geocodingUrl;
}

