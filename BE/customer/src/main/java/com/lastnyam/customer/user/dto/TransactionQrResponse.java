package com.lastnyam.customer.user.dto;

import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.FoocketingTransaction;
import com.lastnyam.database.entity.enums.TransactionStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionQrResponse {
    private Integer transactionId;
    private TransactionStatus transactionStatus;
    private String transactionQrImage;
    private LocalDateTime createdAt;
    private Integer shopId;
    private String shopName;

    public static TransactionQrResponse fromDiscount(DiscountTransaction transaction) {
        return TransactionQrResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .shopId(transaction.getShop().getShopId())
                .shopName(transaction.getShop().getShopName())
                .build();
    }

    public static TransactionQrResponse fromFoocketing(FoocketingTransaction transaction) {
        return TransactionQrResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .shopId(transaction.getShop().getShopId())
                .shopName(transaction.getShop().getShopName())
                .build();
    }
}
