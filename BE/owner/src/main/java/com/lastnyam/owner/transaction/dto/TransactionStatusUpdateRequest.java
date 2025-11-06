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
public class TransactionStatusUpdateRequest {
    private TransactionType transactionType;
    private TransactionStatus status;
}




