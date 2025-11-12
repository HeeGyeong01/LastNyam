package com.lastnyam.owner.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingCreateRequest {
    private LocalDateTime foocketingTime;
    private Integer foocketingAmount;
    private Integer menuId;
}
