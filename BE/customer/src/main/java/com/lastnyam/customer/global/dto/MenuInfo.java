package com.lastnyam.customer.global.dto;

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
    private String description;
    private Integer price;
    private String photoUrl;
}