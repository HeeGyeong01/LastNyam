package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "discount_transactions")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountTransaction {
    
    @Id
    @Column(name = "transaction_id")
    private Integer transactionId;
    
    @Column(name = "transaction_amount", nullable = false)
    private Integer transactionAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status", nullable = false)
    private TransactionStatus transactionStatus;
    
    @Column(name = "transaction_qr_image")
    private Integer transactionQrImage;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "discount_id", nullable = false)
    private Integer discountId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", insertable = false, updatable = false)
    private Discount discount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    public enum TransactionStatus {
        PENDING, COMPLETED, CANCELLED
    }
}
