package com.lastnyam.owner.transaction.dto;

import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.transaction.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStatusUpdateResponse {
    private Integer transactionId;
    private TransactionStatus status;
    private String TransactionType;
    
    public static TransactionStatusUpdateResponse of(Integer transactionId, TransactionStatus status, TransactionType transactionType) {
        return TransactionStatusUpdateResponse.builder()
                .transactionId(transactionId)
                .status(status)
                .TransactionType(transactionType.name())
                .build();
    }
}




