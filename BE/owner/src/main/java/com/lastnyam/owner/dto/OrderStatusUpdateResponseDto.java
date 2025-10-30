package com.lastnyam.owner.dto;

import com.lastnyam.database.entity.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateResponseDto {
    private Integer orderId;
    private TransactionStatus status;
    private String orderType;
}




