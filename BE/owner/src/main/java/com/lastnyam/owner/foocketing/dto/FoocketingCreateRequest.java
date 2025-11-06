package com.lastnyam.owner.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingCreateRequest {
    private LocalTime foocketingTime;
    private Integer foocketingAmount;
    private Integer menuId;
}
