package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shop_rating_log")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ShopRatingLogId.class)
public class ShopRatingLog {
    
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Id
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
