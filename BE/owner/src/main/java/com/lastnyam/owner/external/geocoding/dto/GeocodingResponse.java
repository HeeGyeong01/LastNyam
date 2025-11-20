package com.lastnyam.owner.external.geocoding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeocodingResponse {
    
    private List<Result> results;
    private String status;
    
    @JsonProperty("error_message")
    private String errorMessage;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        @JsonProperty("formatted_address")
        private String formattedAddress;
        
        private Geometry geometry;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Geometry {
        private Location location;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double lat;
        private Double lng;
    }
}

