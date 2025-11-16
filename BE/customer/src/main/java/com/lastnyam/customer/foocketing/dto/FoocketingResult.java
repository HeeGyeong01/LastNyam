package com.lastnyam.customer.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingResult {
    private boolean isSuccess;
    private Integer rank;
    private Integer shopId;
}
