package com.lastnyam.owner.transaction.service;

import com.lastnyam.database.entity.*;
import com.lastnyam.database.entity.enums.TransactionStatus;
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
    public TransactionStatusUpdateResponse updateTransactionStatus(Integer ownerId, Integer transactionId, TransactionStatusUpdateRequest request) {
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
            throw new TransactionException(TransactionErrorCode.NOT_SHOP_OWNER);
        }

        transaction.setTransactionStatus(newStatus);

        return TransactionStatusUpdateResponse.builder()
                .transactionId(transaction.getTransactionId())
                .status(transaction.getTransactionStatus())
                .TransactionType(TransactionType.DISCOUNT.name())
                .build();
    }

    private TransactionStatusUpdateResponse updateFoocketingStatus(Integer ownerId, Integer orderId, TransactionStatus newStatus) {
        FoocketingTransaction transaction = foocketingTransactionRepository.findById(orderId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        Shop shop = transaction.getFoocketing().getMenu().getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(TransactionErrorCode.NOT_SHOP_OWNER);
        }

        transaction.setTransactionStatus(newStatus);

        return TransactionStatusUpdateResponse.builder()
                .transactionId(transaction.getTransactionId())
                .status(transaction.getTransactionStatus())
                .TransactionType(TransactionType.FOOCKETING.name())
                .build();
    }

    @Transactional(readOnly = true)
    public TransactionDetailResponse getTransactionDetail(Integer ownerId, Integer transactionId, TransactionType transactionType) {
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
            throw new TransactionException(TransactionErrorCode.NOT_SHOP_OWNER);
        }

        // 트랜잭션 아이템 조회
        List<DiscountTransactionItem> items = discountTransactionItemRepository.findByTransactionId(transactionId);

        // DTO로 변환
        List<TransactionDetailResponse.DiscountTransactionItemDto> itemDtos = items.stream()
                .map(item -> {
                    Discount discount = item.getDiscount();
                    Menu menu = discount.getMenu();
                    return TransactionDetailResponse.DiscountTransactionItemDto.builder()
                            .transactionItemId(item.getTransactionItemId())
                            .transactionAmount(item.getTransactionAmount())
                            .discountId(discount.getDiscountId())
                            .discountRate(discount.getDiscountRate())
                            .discountPrice(discount.getDiscountPrice())
                            .menuId(menu.getMenuId())
                            .menuName(menu.getMenuName())
                            .menuPrice(menu.getMenuPrice())
                            .menuImage(menu.getMenuImage())
                            .build();
                })
                .collect(Collectors.toList());

        User user = transaction.getUser();

        return TransactionDetailResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .transactionType(TransactionType.DISCOUNT.name())
                .userId(user.getUserId())
                .userNickname(user.getUserNickname())
                .userProfile(user.getUserProfile())
                .shopId(shop.getShopId())
                .shopName(shop.getShopName())
                .discountItems(itemDtos)
                .build();
    }

    private TransactionDetailResponse getFoocketingTransactionDetail(Integer ownerId, Integer transactionId) {
        // 트랜잭션 조회
        FoocketingTransaction transaction = foocketingTransactionRepository.findByIdWithDetails(transactionId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));

        // 점주 권한 확인
        Shop shop = transaction.getShop();
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(TransactionErrorCode.NOT_SHOP_OWNER);
        }

        Foocketing foocketing = transaction.getFoocketing();
        Menu menu = foocketing.getMenu();
        User user = transaction.getUser();

        // 푸켓팅 상세 정보
        TransactionDetailResponse.FoocketingDetailDto foocketingDetail =
                TransactionDetailResponse.FoocketingDetailDto.builder()
                        .foocketingId(foocketing.getFoocketingId())
                        .foocketingTime(foocketing.getFoocketingTime())
                        .foocketingAmount(foocketing.getFoocketingAmount())
                        .menuId(menu.getMenuId())
                        .menuName(menu.getMenuName())
                        .menuPrice(menu.getMenuPrice())
                        .menuImage(menu.getMenuImage())
                        .build();

        return TransactionDetailResponse.builder()
                .transactionId(transaction.getTransactionId())
                .transactionStatus(transaction.getTransactionStatus())
                .transactionQrImage(transaction.getTransactionQrImage())
                .createdAt(transaction.getCreatedAt())
                .transactionType(TransactionType.FOOCKETING.name())
                .userId(user.getUserId())
                .userNickname(user.getUserNickname())
                .userProfile(user.getUserProfile())
                .shopId(shop.getShopId())
                .shopName(shop.getShopName())
                .foocketingDetail(foocketingDetail)
                .build();
    }

    @Transactional(readOnly = true)
    public TransactionListResponse getActiveTransactions(Integer ownerId, Integer shopId) {
        // 가게 확인 및 점주 권한 확인
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new TransactionException(TransactionErrorCode.TRANSACTION_NOT_FOUND));
        
        if (!shop.getOwner().getOwnerId().equals(ownerId)) {
            throw new TransactionException(TransactionErrorCode.NOT_SHOP_OWNER);
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
                    .map(dt -> {
                        // 그룹핑된 아이템 가져오기
                        List<DiscountTransactionItem> items = 
                                itemsByTransactionId.getOrDefault(dt.getTransactionId(), List.of());
                        
                        List<TransactionListResponse.ItemDto> itemDtos = items.stream()
                                .map(item -> {
                                    Integer menuPrice = item.getDiscount().getDiscountPrice();
                                    Integer amount = item.getTransactionAmount();
                                    Integer subtotal = menuPrice * amount;
                                    
                                    return TransactionListResponse.ItemDto.builder()
                                            .menuName(item.getDiscount().getMenu().getMenuName())
                                            .menuPrice(menuPrice)
                                            .amount(amount)
                                            .subtotal(subtotal)
                                            .build();
                                })
                                .toList();
                        
                        // 전체 합산금액 계산
                        Integer totalAmount = itemDtos.stream()
                                .mapToInt(TransactionListResponse.ItemDto::getSubtotal)
                                .sum();
                        
                        return TransactionListResponse.TransactionDto.builder()
                                .transactionId(dt.getTransactionId())
                                .transactionStatus(dt.getTransactionStatus())
                                .createdAt(dt.getCreatedAt())
                                .transactionType(TransactionType.DISCOUNT.name())
                                .itemDtos(itemDtos)
                                .totalAmount(totalAmount)
                                .build();
                    })
                    .toList();
        }

        // 푸켓팅 트랜잭션을 DTO로 변환
        List<TransactionListResponse.TransactionDto> foocketingDtos = foocketingTransactions.stream()
                .map(ft -> {
                    Foocketing foocketing = ft.getFoocketing();
                    Menu menu = foocketing.getMenu();
                    
                    Integer menuPrice = menu.getMenuPrice();
                    Integer amount = 1;
                    Integer subtotal = menuPrice * amount;
                    
                    // 푸켓팅은 단일 메뉴이므로 1개짜리 리스트
                    List<TransactionListResponse.ItemDto> itemDtos = List.of(
                            TransactionListResponse.ItemDto.builder()
                                    .menuName(menu.getMenuName())
                                    .menuPrice(menuPrice)
                                    .amount(amount)
                                    .subtotal(subtotal)
                                    .build()
                    );
                    
                    return TransactionListResponse.TransactionDto.builder()
                            .transactionId(ft.getTransactionId())
                            .transactionStatus(ft.getTransactionStatus())
                            .createdAt(ft.getCreatedAt())
                            .transactionType(TransactionType.FOOCKETING.name())
                            .itemDtos(itemDtos)
                            .totalAmount(subtotal)  // 푸켓팅은 단일 메뉴이므로 subtotal과 동일
                            .build();
                })
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
}
