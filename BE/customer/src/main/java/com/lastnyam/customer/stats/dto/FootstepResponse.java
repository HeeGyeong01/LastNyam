package com.lastnyam.customer.stats.dto;

import com.lastnyam.database.entity.Statistics;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FootstepResponse {
    private Integer statisticsId;
    private Double carbonFootprints;
    private LocalDateTime createdAt;

    public static FootstepResponse from(Statistics stat) {
        return FootstepResponse.builder()
                .statisticsId(stat.getStatisticsId())
                .carbonFootprints(stat.getCarbonFootprints())
                .createdAt(stat.getCreatedAt())
                .build();
    }
}
