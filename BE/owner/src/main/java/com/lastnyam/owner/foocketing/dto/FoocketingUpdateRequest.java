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
public class FoocketingUpdateRequest {
    private LocalTime foocketingTime;
    private Integer foocketingAmount;
}

