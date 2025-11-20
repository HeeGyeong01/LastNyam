package com.lastnyam.customer.time.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentTimeResponse {
    public ZonedDateTime currentTime;
}
