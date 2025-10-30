package com.lastnyam.owner.service;

import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.FookectingTransaction;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.dto.OrderStatusUpdateRequestDto;
import com.lastnyam.owner.dto.OrderStatusUpdateResponseDto;
import com.lastnyam.owner.enums.OrderType;
import com.lastnyam.owner.exception.ShopException;
import com.lastnyam.owner.repository.DiscountTransactionRepository;
import com.lastnyam.owner.repository.FookectingTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final DiscountTransactionRepository discountTransactionRepository;
    private final FookectingTransactionRepository fookectingTransactionRepository;

    @Transactional
    public OrderStatusUpdateResponseDto updateOrderStatus(Integer ownerId, Integer orderId, OrderStatusUpdateRequestDto request) {
        return switch (request.getOrderType()) {
            case OrderType.DISCOUNT -> updateDiscountStatus(ownerId, orderId, request.getStatus());
            case OrderType.FOOKECTING -> updateFookectingStatus(ownerId, orderId, request.getStatus());
            default -> throw new ShopException("유효하지 않은 주문 타입입니다.", 400);
        };
    }

    private OrderStatusUpdateResponseDto updateDiscountStatus(Integer ownerId, Integer orderId, TransactionStatus newStatus) {
        DiscountTransaction transaction = discountTransactionRepository.findById(orderId)
                .orElseThrow(() -> new ShopException("주문을 찾을 수 없습니다.", 404));

        Shop shop = transaction.getDiscount().getMenu().getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new ShopException("해당 가게의 점주가 아닙니다.", 403);
        }

        transaction.setTransactionStatus(newStatus);

        return OrderStatusUpdateResponseDto.builder()
                .orderId(transaction.getTransactionId())
                .status(transaction.getTransactionStatus())
                .orderType(OrderType.DISCOUNT.name())
                .build();
    }

    private OrderStatusUpdateResponseDto updateFookectingStatus(Integer ownerId, Integer orderId, TransactionStatus newStatus) {
        FookectingTransaction transaction = fookectingTransactionRepository.findById(orderId)
                .orElseThrow(() -> new ShopException("주문을 찾을 수 없습니다.", 404));

        Shop shop = transaction.getFookecting().getMenu().getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new ShopException("해당 가게의 점주가 아닙니다.", 403);
        }

        transaction.setTransactionStatus(newStatus);

        return OrderStatusUpdateResponseDto.builder()
                .orderId(transaction.getTransactionId())
                .status(transaction.getTransactionStatus())
                .orderType(OrderType.FOOKECTING.name())
                .build();
    }
}
