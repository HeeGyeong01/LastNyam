package com.lastnyam.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shop_ratings")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopRating {

    @Id
    @Column(name = "shop_id")
    private Integer shopId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(name = "shop_rating_sum", nullable = false)
    private Integer shopRatingSum;

    @Column(name = "shop_rating_count", nullable = false)
    private Integer shopRatingCount;

    @Column(name = "shop_favorite_count", nullable = false)
    private Integer shopFavoriteCount;

    @Column(name = "shop_rating_avg", nullable = false)
    private Integer shopRatingAverage;
}
