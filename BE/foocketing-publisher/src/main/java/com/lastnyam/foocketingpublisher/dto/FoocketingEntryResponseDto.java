package com.lastnyam.foocketingpublisher.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 푸켓팅 참여 API 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingEntryResponseDto {
    
    private Boolean success;
}

