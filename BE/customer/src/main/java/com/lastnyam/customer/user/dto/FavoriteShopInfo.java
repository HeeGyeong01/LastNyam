package com.lastnyam.customer.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteShopInfo {
    private Integer shopId;
    private String name;
    private Double lat;
    private Double lng;
    private Double distance;
    private Double rating;
    private Integer ratingCount;
    private List<String> onSaleMenus;
    private String bannerUrl;

}
