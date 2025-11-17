package com.lastnyam.owner.external.geocoding.service;

import com.lastnyam.owner.external.geocoding.configuration.GeocodingConfiguration;
import com.lastnyam.owner.external.geocoding.dto.Coordinates;
import com.lastnyam.owner.external.geocoding.dto.GeocodingResponse;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.exception.ShopException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {
    
    private final RestClient restClient;
    private final GeocodingConfiguration geocodingConfig;
    
    /**
     * 주소를 위도/경도로 변환
     * @param address 주소
     * @return 위도/경도 좌표
     * @throws ShopException 지오코딩 실패 시
     */
    public Coordinates getCoordinates(String address) {
        try {
            String uriString = UriComponentsBuilder
                    .fromUriString(geocodingConfig.getGeocodingUrl())
                    .queryParam("address", address)
                    .queryParam("language", "ko")
                    .queryParam("region", "kr")
                    .queryParam("key", geocodingConfig.getApiKey())
                    .build()
                    .encode()
                    .toUriString();
            
            log.info("Geocoding request for address: {}, URI: {}", address, uriString);
            
            // 이미 인코딩된 URI 문자열을 URI 객체로 변환하여 전달
            GeocodingResponse response = restClient.get()
                    .uri(java.net.URI.create(uriString))
                    .retrieve()
                    .body(GeocodingResponse.class);
            
            log.debug("Geocoding response: status={}, results size={}", 
                    response != null ? response.getStatus() : "null",
                    response != null && response.getResults() != null ? response.getResults().size() : 0);
            
            if (response == null || !"OK".equals(response.getStatus())) {
                String errorMsg = response != null ? response.getErrorMessage() : "null";
                log.error("Geocoding failed for address: {}. Status: {}, Error: {}", 
                        address, response != null ? response.getStatus() : "null", errorMsg);
                throw new ShopException(ShopErrorCode.GEOCODING_FAILED);
            }
            
            if (response.getResults().isEmpty()) {
                log.error("No results found for address: {}", address);
                throw new ShopException(ShopErrorCode.GEOCODING_NO_RESULTS);
            }
            
            GeocodingResponse.Location location = response.getResults().get(0)
                    .getGeometry()
                    .getLocation();
            
            log.info("Geocoding successful for address: {}. Lat: {}, Lng: {}", 
                    address, location.getLat(), location.getLng());
            
            return Coordinates.builder()
                    .latitude(location.getLat())
                    .longitude(location.getLng())
                    .build();
            
        } catch (Exception e) {
            log.error("Geocoding API call failed for address: {}", address, e);
            throw new ShopException(ShopErrorCode.GEOCODING_API_ERROR);
        }
    }
}

