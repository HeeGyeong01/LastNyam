package com.lastnyam.owner.transaction.dto;

import com.lastnyam.database.entity.enums.TransactionStatus;
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
}




