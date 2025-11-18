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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
