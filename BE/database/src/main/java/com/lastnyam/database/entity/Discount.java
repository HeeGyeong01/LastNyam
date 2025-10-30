package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "discounts")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Integer discountId;

    @Column(name = "discount_date", nullable = false)
    private LocalDate discountDate;

    @Column(name = "discount_rate", nullable = false)
    private Integer discountRate;

    @Column(name = "discount_price", nullable = false)
    private Integer discountPrice;

    @Column(name = "discount_menu_amount", nullable = false)
    private Integer discountMenuAmount;

    @Column(name = "discount_close_time", nullable = false)
    private LocalDateTime discountCloseTime;

    @Column(name = "discount_pickup_end_time", nullable = false)
    private LocalDateTime discountPickupEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private Menu menu;

    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiscountTransaction> discountTransactions;
}
