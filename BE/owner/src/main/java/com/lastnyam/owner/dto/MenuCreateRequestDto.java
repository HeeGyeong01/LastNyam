package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCreateRequestDto {
    private String menuName;
    private String menuDescription;
    private String menuImage;
    private Integer menuPrice;
    private String category;
}
