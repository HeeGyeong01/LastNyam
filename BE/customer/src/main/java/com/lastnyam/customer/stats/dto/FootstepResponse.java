package com.lastnyam.customer.stats.dto;

import com.lastnyam.database.entity.statistics;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootstepResponse {
    private Integer statisticsId;
    private Double carbonFootprints;
    private LocalDateTime createdAt;

    public static FootstepResponse from(statistics stat) {
        return FootstepResponse.builder()
                .statisticsId(stat.getStatisticsId())
                .carbonFootprints(stat.getCarbonFootprints())
                .createdAt(stat.getCreatedAt())
                .build();
    }
}
