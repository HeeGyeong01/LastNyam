package com.lastnyam.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shop_views")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopView {

    @Id
    @Column(name = "shop_id")
    private Integer shopId;

    @Column(name = "shop_view_count", nullable = false)
    private Integer shopViewCount;

    @Column(name = "shop_favorite_count", nullable = false)
    private Integer shopFavoriteCount;

    @Column(name = "shop_view_prev_count", nullable = false)
    private Integer shopViewPrevCount;

    @Column(name = "shop_favorite_prev_count", nullable = false)
    private Integer shopFavoritePrevCount;

    // 전주 통계 데이터 (저저번주와 비교하기 위한 기준)
    @Column(name = "shop_total_sales_prev_count")
    private Integer shopTotalSalesPrevCount;

    @Column(name = "shop_total_revenue_prev")
    private Integer shopTotalRevenuePrev;

    @Column(name = "shop_pocketing_prev_count")
    private Integer shopPocketingPrevCount;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
