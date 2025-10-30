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
public class FookectingCreateRequestDto {
    private LocalDateTime fookectingTime;
    private Integer fookectingAmount;
    private Integer menuId;
}
