package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shop_view_log")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopViewLog {
    
    @Id
    @Column(name = "shop_view_log_id")
    private Integer shopViewLogId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}
