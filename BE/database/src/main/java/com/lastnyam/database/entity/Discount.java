package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "discounts")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {
    
    @Id
    @Column(name = "discount_id")
    private Integer discountId;
    
    @Column(name = "discount_date", nullable = false)
    private LocalDate discountDate;
    
    @Column(name = "discount_rate", nullable = false)
    private Integer discountRate;
    
    @Column(name = "discount_price", nullable = false)
    private Integer discountPrice;
    
    @Column(name = "discount_end_time", nullable = false)
    private LocalDateTime discountEndTime;
    
    @Column(name = "discount_retrieve_limit", nullable = false)
    private Integer discountRetrieveLimit;
    
    @Column(name = "discount_menu_amount", nullable = false)
    private Integer discountMenuAmount;
    
    @Column(name = "menu_id", nullable = false)
    private Integer menuId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", insertable = false, updatable = false)
    private Menu menu;
    
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CartItem> cartItems;
    
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiscountTransaction> discountTransactions;
}
