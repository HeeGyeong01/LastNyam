package com.lastnyam.owner.transaction.service;

import com.lastnyam.database.entity.*;
import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.shop.exception.ShopErrorCode;
import com.lastnyam.owner.shop.repository.ShopRepository;
import com.lastnyam.owner.transaction.dto.TransactionDetailResponse;
import com.lastnyam.owner.transaction.dto.TransactionListResponse;
import com.lastnyam.owner.transaction.dto.TransactionStatusUpdateRequest;
import com.lastnyam.owner.transaction.dto.TransactionStatusUpdateResponse;
import com.lastnyam.owner.transaction.enums.TransactionType;
import com.lastnyam.owner.transaction.exception.TransactionErrorCode;
import com.lastnyam.owner.transaction.exception.TransactionException;
import com.lastnyam.owner.transaction.repository.DiscountTransactionItemRepository;
import com.lastnyam.owner.transaction.repository.DiscountTransactionRepository;
import com.lastnyam.owner.transaction.repository.FoocketingTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final DiscountTransactionRepository discountTransactionRepository;
    private final FoocketingTransactionRepository foocketingTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;
    private final ShopRepository shopRepository;

    @Transactional
    public TransactionStatusUpdateResponse updateTransactionStatus(Integer userId, Integer ownerId, Integer transactionId, TransactionStatusUpdateRequest request) {
        checkPermission(userId, ownerId);
        return switch (request.getTransactionType()) {
            case TransactionType.DISCOUNT -> updateDiscountStatus(ownerId, transactionId, request.getStatus());
            case TransactionType.FOOCKETING -> updateFoocketingStatus(ownerId, transactionId, request.getStatus());
            default -> throw new TransactionException(TransactionErrorCode.INVALID_TRANSACTION_TYPE);
        };
    }

    private TransactionStatusUpdateResponse updateDiscountStatus(Integer ownerId, Integer transactionId, TransactionStatus newStatus) {
        DiscountTransaction transaction = discountTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        Shop shop = transaction.getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        transaction.setTransactionStatus(newStatus);

        return TransactionStatusUpdateResponse.of(
                transaction.getTransactionId(),
                transaction.getTransactionStatus(),
                TransactionType.DISCOUNT
        );
    }

    private TransactionStatusUpdateResponse updateFoocketingStatus(Integer ownerId, Integer orderId, TransactionStatus newStatus) {
        FoocketingTransaction transaction = foocketingTransactionRepository.findById(orderId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        Shop shop = transaction.getFoocketing().getMenu().getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        transaction.setTransactionStatus(newStatus);

        return TransactionStatusUpdateResponse.of(
                transaction.getTransactionId(),
                transaction.getTransactionStatus(),
                TransactionType.FOOCKETING
        );
    }

    @Transactional(readOnly = true)
    public TransactionDetailResponse getTransactionDetail(Integer userId, Integer ownerId, Integer transactionId, TransactionType transactionType) {
        checkPermission(userId, ownerId);
        return switch (transactionType) {
            case TransactionType.DISCOUNT -> getDiscountTransactionDetail(ownerId, transactionId);
            case TransactionType.FOOCKETING -> getFoocketingTransactionDetail(ownerId, transactionId);
            default -> throw new TransactionException(TransactionErrorCode.INVALID_TRANSACTION_TYPE);
        };
    }

    private TransactionDetailResponse getDiscountTransactionDetail(Integer ownerId, Integer transactionId) {
        // 트랜잭션 조회
        DiscountTransaction transaction = discountTransactionRepository.findByIdWithDetails(transactionId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        // 점주 권한 확인
        Shop shop = transaction.getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 트랜잭션 아이템 조회
        List<DiscountTransactionItem> items = discountTransactionItemRepository.findByTransactionId(transactionId);

        // DTO로 변환
        return TransactionDetailResponse.ofDiscount(transaction, items);
    }

    private TransactionDetailResponse getFoocketingTransactionDetail(Integer ownerId, Integer transactionId) {
        // 트랜잭션 조회
        FoocketingTransaction transaction = foocketingTransactionRepository.findByIdWithDetails(transactionId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        // 점주 권한 확인
        Shop shop = transaction.getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // DTO로 변환
        return TransactionDetailResponse.ofFoocketing(transaction);
    }

    @Transactional(readOnly = true)
    public TransactionListResponse getActiveTransactions(Integer userId, Integer ownerId, Integer shopId) {
        checkPermission(userId, ownerId);
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));
        
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(ShopErrorCode.NOT_SHOP_OWNER);
        }

        // 제외할 상태 목록 (노쇼, 픽업 완료)
        List<TransactionStatus> excludedStatuses = Arrays.asList(
                TransactionStatus.NO_SHOW,
                TransactionStatus.COMPLETED_PICKUP
        );

        // 마감세일 트랜잭션 조회
        List<DiscountTransaction> discountTransactions = 
                discountTransactionRepository.findByShopIdAndStatusNotIn(shopId, excludedStatuses);
        
        // 푸켓팅 트랜잭션 조회
        List<FoocketingTransaction> foocketingTransactions = 
                foocketingTransactionRepository.findByShopIdAndStatusNotIn(shopId, excludedStatuses);

        // 마감세일 트랜잭션의 모든 아이템을 한 번에 조회
        List<TransactionListResponse.TransactionDto> discountDtos = List.of();
        if (!discountTransactions.isEmpty()) {
            List<Integer> transactionIds = discountTransactions.stream()
                    .map(DiscountTransaction::getTransactionId)
                    .toList();
            
            // 모든 아이템 조회
            List<DiscountTransactionItem> allItems = 
                    discountTransactionItemRepository.findByTransactionIdIn(transactionIds);
            
            // transactionId별로 그룹핑
            Map<Integer, List<DiscountTransactionItem>> itemsByTransactionId = allItems.stream()
                    .collect(Collectors.groupingBy(
                            item -> item.getDiscountTransaction().getTransactionId()
                    ));
            
            // 마감세일 트랜잭션을 DTO로 변환
            discountDtos = discountTransactions.stream()
                    .map(transaction -> {
                        // 그룹핑된 아이템 가져오기
                        List<DiscountTransactionItem> items = 
                                itemsByTransactionId.getOrDefault(transaction.getTransactionId(), List.of());
                        return TransactionListResponse.TransactionDto.ofDiscount(transaction, items);
                    })
                    .toList();
        }

        // 푸켓팅 트랜잭션을 DTO로 변환
        List<TransactionListResponse.TransactionDto> foocketingDtos = foocketingTransactions.stream()
                .map(TransactionListResponse.TransactionDto::ofFoocketing)
                .toList();

        // 두 리스트를 합치고 생성일자 기준 내림차순 정렬
        List<TransactionListResponse.TransactionDto> allTransactions = new ArrayList<>();
        allTransactions.addAll(discountDtos);
        allTransactions.addAll(foocketingDtos);
        allTransactions.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return TransactionListResponse.builder()
                .transactions(allTransactions)
                .build();
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new TransactionException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
