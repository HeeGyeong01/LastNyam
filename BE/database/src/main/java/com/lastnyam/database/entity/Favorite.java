package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "favorites")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    
    @Id
    @Column(name = "favorite_id")
    private Integer favoriteId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
