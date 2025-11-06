package com.lastnyam.foocketingsubscriber.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingEntryPayload {
    private Integer foocketingId;
    private Integer userId;
}


