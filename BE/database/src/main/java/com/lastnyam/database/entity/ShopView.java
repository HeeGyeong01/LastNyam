package com.lastnyam.database.entity;

import jakarta.persistence.*;
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
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
