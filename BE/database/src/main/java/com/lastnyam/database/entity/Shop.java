package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shops")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shop {
    
    @Id
    @Column(name = "shop_id")
    private Integer shopId;
    
    @Column(name = "shop_name", length = 50, nullable = false)
    private String shopName;
    
    @Column(name = "shop_lat", nullable = false)
    private Double shopLat;
    
    @Column(name = "shop_lng", nullable = false)
    private Double shopLng;
    
    @Column(name = "shop_description", length = 255)
    private String shopDescription;
    
    @Column(name = "shop_banner", length = 255)
    private String shopBanner;
    
    @Column(name = "shop_closes", length = 255)
    private String shopCloses;
    
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;
    
    @Column(name = "shopkeeper_id", nullable = false)
    private Integer shopkeeperId;
}
