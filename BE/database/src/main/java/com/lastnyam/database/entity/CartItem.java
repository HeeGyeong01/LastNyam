package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_items")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    
    @Id
    @Column(name = "cart_item_id")
    private Integer cartItemId;
    
    @Column(name = "cart_item_amount", nullable = false)
    private Integer cartItemAmount;
    
    @Column(name = "cart_id", nullable = false)
    private Integer cartId;
    
    @Column(name = "discount_id", nullable = false)
    private Integer discountId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", insertable = false, updatable = false)
    private Cart cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", insertable = false, updatable = false)
    private Discount discount;
}
