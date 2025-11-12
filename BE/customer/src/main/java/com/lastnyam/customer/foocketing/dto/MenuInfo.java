package com.lastnyam.customer.foocketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuInfo {
    private String name;
    private Integer price;
    private String photoUrl;
}