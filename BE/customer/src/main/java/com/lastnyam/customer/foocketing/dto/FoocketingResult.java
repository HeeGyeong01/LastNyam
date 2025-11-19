package com.lastnyam.customer.foocketing.dto;

import com.lastnyam.customer.foocketing.enums.FoocketingResultStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingResult {
    @Builder.Default
    private FoocketingResultStatus status = FoocketingResultStatus.FAIL;
    private Integer rank;
}
