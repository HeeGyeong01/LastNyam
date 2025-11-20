package com.lastnyam.database.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shop_id")
    private Integer shopId;

    @Column(name = "shop_name", length = 50, nullable = false)
    private String shopName;

    @Column(name = "shop_lat", nullable = false)
    private Double shopLat;

    @Column(name = "shop_lng", nullable = false)
    private Double shopLng;

    @Column(name = "shop_address", nullable = false)
    private String shopAddress;

    @Column(name = "shop_description", length = 255)
    private String shopDescription;

    @Column(name = "shop_banner", length = 255)
    private String shopBanner;

    @Column(name = "shop_closes", nullable = false)
    private LocalTime shopCloses;

    @Column(name = "shop_pickup_end_time", nullable = false)
    private LocalTime shopPickupEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private FoodCategory foodCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Owner owner;
}
