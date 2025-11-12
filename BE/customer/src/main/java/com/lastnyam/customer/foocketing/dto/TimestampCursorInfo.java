package com.lastnyam.customer.foocketing.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimestampCursorInfo {
    private LocalDateTime time;
    private Integer id;
}
