package com.lastnyam.customer.global.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfoWithMenu extends ShopInfo {
    private List<String> salesMenu;

    public static ShopInfoWithMenu of(ShopInfo info, List<String> menus) {
        ShopInfoWithMenu shopInfoWithMenu = new ShopInfoWithMenu();
        shopInfoWithMenu.setShopInfoFrom(info);
        shopInfoWithMenu.setSalesMenu(menus);
        return shopInfoWithMenu;
    }

    private void setShopInfoFrom(ShopInfo info) {
        setShopId(info.getShopId());
        setLat(info.getLat());
        setLng(info.getLng());
        setName(info.getName());
        setBannerUrl(info.getBannerUrl());
        setDistance(info.getDistance());
        setRating(info.getRating());
        setRatingCount(info.getRatingCount());
    }
}
