package com.lastnyam.owner.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCreateRequest {
    private String menuName;
    private String menuDescription;
    private String menuImage;
    private Integer menuPrice;
    private String category;
}
