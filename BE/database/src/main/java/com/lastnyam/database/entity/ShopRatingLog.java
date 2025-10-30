package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shop_rating_log")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ShopRatingLogId.class)
public class ShopRatingLog {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(name = "rating", nullable = false)
    private Integer rating;
}
