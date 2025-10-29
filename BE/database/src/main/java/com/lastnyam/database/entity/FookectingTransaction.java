package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "foocketing_transactions")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FookectingTransaction {
    
    @Id
    @Column(name = "transaction_id")
    private Integer transactionId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status", nullable = false)
    private TransactionStatus transactionStatus;
    
    @Column(name = "transaction_qr_image", length = 255)
    private String transactionQrImage;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "fookecting_id", nullable = false)
    private Integer fookectingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fookecting_id", insertable = false, updatable = false)
    private Fookecting fookecting;
    
    public enum TransactionStatus {
        PENDING, COMPLETED, CANCELLED
    }
}
