package com.lastnyam.customer.user.service;

import com.lastnyam.customer.cart.repository.DiscountTransactionItemRepository;
import com.lastnyam.customer.cart.repository.DiscountTransactionRepository;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.foocketing.repository.FoocketingTransactionRepository;
import com.lastnyam.customer.user.dto.DiscountTransactionInfo;
import com.lastnyam.customer.user.dto.FoocketingTransactionInfo;
import com.lastnyam.customer.user.dto.MenuItemInfo;
import com.lastnyam.customer.user.dto.ShopInfoInTransaction;
import com.lastnyam.customer.user.dto.TransactionQrResponse;
import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.DiscountTransactionItem;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.FoocketingTransaction;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.database.entity.Shop;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private final DiscountTransactionRepository discountTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;
    private final FoocketingTransactionRepository foocketingTransactionRepository;

    /**
     * 마감할인 내 주문 리스트 조회
     *
     * @param userId 사용자 ID
     * @return 마감할인 거래 목록
     */
    @Transactional(readOnly = true)
    public List<DiscountTransactionInfo> getDiscountTransactions(Integer userId) {
        log.info("마감할인 내 주문 리스트 조회: userId={}", userId);

        // 사용자의 모든 마감할인 거래 조회
        List<DiscountTransaction> transactions = discountTransactionRepository.findAllByUserIdWithShop(userId);

        // 각 거래별로 DTO 변환
        return transactions.stream()
                .map(this::convertToDiscountTransactionInfo)
                .collect(Collectors.toList());
    }

    /**
     * DiscountTransaction을 DiscountTransactionInfo로 변환
     */
    private DiscountTransactionInfo convertToDiscountTransactionInfo(DiscountTransaction transaction) {
        Shop shop = transaction.getShop();

        // 가게 정보 변환
        ShopInfoInTransaction shopInfo = ShopInfoInTransaction.builder()
                .shopName(shop.getShopName())
                .shopBanner(shop.getShopBanner())
                .openTime(shop.getShopCloses() != null ? shop.getShopCloses().format(TIME_FORMATTER) : null)
                .build();

        // 거래 항목 조회 (메뉴 정보 포함)
        List<DiscountTransactionItem> items = discountTransactionItemRepository
                .findAllByTransactionIdWithDiscountAndMenu(transaction.getTransactionId());

        // 메뉴 정보 변환
        List<MenuItemInfo> menuInfos = items.stream()
                .map(item -> MenuItemInfo.builder()
                        .menuName(item.getDiscount().getMenu().getMenuName())
                        .price(item.getDiscount().getDiscountPrice()) // 메뉴 하나의 가격
                        .quantity(item.getTransactionAmount()) // 주문한 개수
                        .build())
                .collect(Collectors.toList());

        // 총 결제 금액 계산 - (가격 × 개수)의 합
        Integer totalAmount = items.stream()
                .mapToInt(item -> item.getDiscount().getDiscountPrice() * item.getTransactionAmount())
                .sum();

        return DiscountTransactionInfo.builder()
                .transactionId(transaction.getTransactionId())
                .shop(shopInfo)
                .menus(menuInfos)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * 마감할인 거래 QR 조회
     *
     * @param userId        사용자 ID
     * @param transactionId 거래 ID
     * @return QR 정보
     */
    @Transactional(readOnly = true)
    public TransactionQrResponse getDiscountTransactionQr(Integer userId, Integer transactionId) {
        DiscountTransaction transaction = discountTransactionRepository
                .findByIdAndUserId(transactionId, userId)
                .orElseThrow(ResourceNotFoundException::ofTransaction);

        log.info("마감할인 QR 조회: userId={}, transactionId={}", userId, transactionId);

        return TransactionQrResponse.fromDiscount(transaction);
    }

    /**
     * 푸케팅 내 주문 리스트 조회
     *
     * @param userId 사용자 ID
     * @return 푸케팅 거래 목록
     */
    @Transactional(readOnly = true)
    public List<FoocketingTransactionInfo> getFoocketingTransactions(Integer userId) {
        log.info("푸케팅 내 주문 리스트 조회: userId={}", userId);

        // 사용자의 모든 푸케팅 거래 조회
        List<FoocketingTransaction> transactions = foocketingTransactionRepository
                .findAllByUserIdWithShopAndFoocketing(userId);

        // 각 거래별로 DTO 변환
        return transactions.stream()
                .map(this::convertToFoocketingTransactionInfo)
                .collect(Collectors.toList());
    }

    /**
     * FoocketingTransaction을 FoocketingTransactionInfo로 변환
     */
    private FoocketingTransactionInfo convertToFoocketingTransactionInfo(FoocketingTransaction transaction) {
        Shop shop = transaction.getShop();
        Foocketing foocketing = transaction.getFoocketing();

        // 가게 정보 변환
        ShopInfoInTransaction shopInfo = ShopInfoInTransaction.builder()
                .shopName(shop.getShopName())
                .shopBanner(shop.getShopBanner())
                .openTime(shop.getShopCloses() != null ? shop.getShopCloses().format(TIME_FORMATTER) : null)
                .build();

        Menu menu = foocketing.getMenu();

        // 메뉴 정보 변환 (푸케팅은 거래당 1개의 메뉴)
        MenuItemInfo menuInfo = MenuItemInfo.builder()
                .menuName(menu.getMenuName())
                .price(menu.getMenuPrice()) // 푸케팅 가격
                .quantity(1) // 푸케팅은 항상 1개
                .build();

        // 총 결제 금액 (푸케팅은 1개이므로 foocketingAmount)
        Integer totalAmount = menu.getMenuPrice();

        return FoocketingTransactionInfo.builder()
                .transactionId(transaction.getTransactionId())
                .shop(shopInfo)
                .menus(List.of(menuInfo))
                .totalAmount(totalAmount)
                .foocketingTime(transaction.getCreatedAt())
                .build();
    }

    /**
     * 푸케팅 거래 QR 조회
     *
     * @param userId        사용자 ID
     * @param transactionId 거래 ID
     * @return QR 정보
     */
    @Transactional(readOnly = true)
    public TransactionQrResponse getFoocketingTransactionQr(Integer userId, Integer transactionId) {
        FoocketingTransaction transaction = foocketingTransactionRepository
                .findByIdAndUserId(transactionId, userId)
                .orElseThrow(ResourceNotFoundException::ofTransaction);

        log.info("푸케팅 QR 조회: userId={}, transactionId={}", userId, transactionId);

        return TransactionQrResponse.fromFoocketing(transaction);
    }
}
