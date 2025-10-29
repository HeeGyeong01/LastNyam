package com.lastnyam.database.entity;

import jakarta.persistence.*;
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
    
    @Column(name = "shop_rating_sum", nullable = false)
    private Integer shopRatingSum;
    
    @Column(name = "shop_rating_count", nullable = false)
    private Integer shopRatingCount;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
