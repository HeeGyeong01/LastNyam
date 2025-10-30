package com.lastnyam.owner.dto;

import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.enums.OrderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequestDto {
    private OrderType orderType;
    private TransactionStatus status;
}




