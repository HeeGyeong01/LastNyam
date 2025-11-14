package com.lastnyam.owner.transaction.service;

import com.lastnyam.database.entity.*;
import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.qr.service.QrCodeService;
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
import com.lastnyam.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final DiscountTransactionRepository discountTransactionRepository;
    private final FoocketingTransactionRepository foocketingTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;
    private final ShopRepository shopRepository;
    private final QrCodeService qrCodeService;
    private final S3Service s3Service;

    @Value("${qr.receipt-confirm}")
    private String qrReceiptConfirmBaseUrl;

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

        // 이전 상태 저장
        TransactionStatus oldStatus = transaction.getTransactionStatus();
        
        // 상태 업데이트
        transaction.setTransactionStatus(newStatus);

        // WAITING_PICKUP으로 변경되는 경우 QR 코드 생성 및 S3 업로드
        if (newStatus == TransactionStatus.WAITING_PICKUP && oldStatus != TransactionStatus.WAITING_PICKUP) {
            generateAndUploadQrCode(transaction, "discount");
        }

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

        // 이전 상태 저장
        TransactionStatus oldStatus = transaction.getTransactionStatus();
        
        // 상태 업데이트
        transaction.setTransactionStatus(newStatus);

        // WAITING_PICKUP으로 변경되는 경우 QR 코드 생성 및 S3 업로드
        if (newStatus == TransactionStatus.WAITING_PICKUP && oldStatus != TransactionStatus.WAITING_PICKUP) {
            generateAndUploadQrCodeForFoocketing(transaction, "foocketing");
        }

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
        TransactionDetailResponse response = TransactionDetailResponse.ofDiscount(transaction, items);
        
        // QR 이미지가 있으면 presigned URL로 변환
        if (response.getTransactionQrImage() != null) {
            String presignedUrl = s3Service.generatePresignedGetUrl(response.getTransactionQrImage());
            response.setTransactionQrImage(presignedUrl);
        }
        
        return response;
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
        TransactionDetailResponse response = TransactionDetailResponse.ofFoocketing(transaction);
        
        // QR 이미지가 있으면 presigned URL로 변환
        if (response.getTransactionQrImage() != null) {
            String presignedUrl = s3Service.generatePresignedGetUrl(response.getTransactionQrImage());
            response.setTransactionQrImage(presignedUrl);
        }
        
        return response;
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

    /**
     * QR 코드를 생성하고 S3에 업로드한 후 DiscountTransaction에 fileKey 저장
     *
     * @param transaction 디스카운트 트랜잭션
     * @param transactionType 트랜잭션 타입
     */
    private void generateAndUploadQrCode(DiscountTransaction transaction, String transactionType) {
        try {
            log.info("QR 코드 생성 시작 - Transaction ID: {}, Type: {}", 
                    transaction.getTransactionId(), transactionType);

            // QR 코드에 포함될 URL 생성
            String pickupUrl = String.format("%s?type=%s&id=%d",
                    qrReceiptConfirmBaseUrl,
                    transactionType, 
                    transaction.getTransactionId());

            // QR 코드 이미지 생성
            byte[] qrCodeData = qrCodeService.generateQrCode(pickupUrl);

            // QR 코드 파일명 생성
            String fileName = qrCodeService.generateQrCodeFileName(
                    transaction.getTransactionId(), 
                    transactionType);

            // S3에 업로드 (fileKey 반환)
            String fileKey = s3Service.uploadFile(
                    qrCodeData, 
                    fileName, 
                    "image/png", 
                    "qr-codes/");

            // 트랜잭션에 QR 코드 fileKey 저장
            transaction.setTransactionQrImage(fileKey);

            log.info("QR 코드 생성 및 업로드 완료 - fileKey: {}", fileKey);

        } catch (Exception e) {
            log.error("QR 코드 생성 및 업로드 실패 - Transaction ID: {}", 
                    transaction.getTransactionId(), e);
            // QR 코드 생성 실패가 주문 상태 변경을 막지 않도록 예외를 던지지 않음
            // 필요시 알림이나 재시도 로직 추가 가능
        }
    }

    /**
     * QR 코드를 생성하고 S3에 업로드한 후 FoocketingTransaction에 fileKey 저장
     *
     * @param transaction 푸켓팅 트랜잭션
     * @param transactionType 트랜잭션 타입
     */
    private void generateAndUploadQrCodeForFoocketing(FoocketingTransaction transaction, String transactionType) {
        try {
            log.info("QR 코드 생성 시작 - Transaction ID: {}, Type: {}", 
                    transaction.getTransactionId(), transactionType);

            // QR 코드에 포함될 URL 생성
            String pickupUrl = String.format("%s?type=%s&id=%d",
                    qrReceiptConfirmBaseUrl,
                    transactionType, 
                    transaction.getTransactionId());

            // QR 코드 이미지 생성
            byte[] qrCodeData = qrCodeService.generateQrCode(pickupUrl);

            // QR 코드 파일명 생성
            String fileName = qrCodeService.generateQrCodeFileName(
                    transaction.getTransactionId(), 
                    transactionType);

            // S3에 업로드 (fileKey 반환)
            String fileKey = s3Service.uploadFile(
                    qrCodeData, 
                    fileName, 
                    "image/png", 
                    "qr-codes/");

            // 트랜잭션에 QR 코드 fileKey 저장
            transaction.setTransactionQrImage(fileKey);

            log.info("QR 코드 생성 및 업로드 완료 - fileKey: {}", fileKey);

        } catch (Exception e) {
            log.error("QR 코드 생성 및 업로드 실패 - Transaction ID: {}", 
                    transaction.getTransactionId(), e);
            // QR 코드 생성 실패가 주문 상태 변경을 막지 않도록 예외를 던지지 않음
            // 필요시 알림이나 재시도 로직 추가 가능
        }
    }
}
