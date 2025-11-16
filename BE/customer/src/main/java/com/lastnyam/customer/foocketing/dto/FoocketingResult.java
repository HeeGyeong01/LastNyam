package com.lastnyam.customer.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingResult {
    @Builder.Default
    private boolean isSuccess = false;
    private Integer rank;
}
