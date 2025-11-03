package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingCreateRequestDto {
    private LocalDateTime foocketingTime;
    private Integer foocketingAmount;
    private Integer menuId;
}
