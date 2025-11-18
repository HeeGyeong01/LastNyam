package com.lastnyam.foocketingsubscriber.subscriber;

import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.FoocketingTransaction;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.User;
import com.lastnyam.database.entity.enums.TransactionStatus;
import com.lastnyam.foocketingsubscriber.event.FoocketingEntryCompleteEvent;
import com.lastnyam.foocketingsubscriber.repository.FoocketingLogRepository;
import com.lastnyam.foocketingsubscriber.repository.FoocketingRepository;
import com.lastnyam.foocketingsubscriber.repository.FoocketingTransactionRepository;
import com.lastnyam.foocketingsubscriber.repository.UserRepository;
import com.lastnyam.foocketingsubscriber.service.QrCodeService;
import com.lastnyam.s3.service.S3Service;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class CompleteEventSubscriber {

    private final FoocketingRepository repository;
    private final UserRepository userRepository;
    private final FoocketingLogRepository logRepository;
    private final FoocketingTransactionRepository transactionRepository;
    private final QrCodeService qrCodeService;
    private final S3Service s3Service;

    @Value("${qr.receipt-confirm}")
    private String qrReceiptConfirmBaseUrl;

    @Transactional
    @EventListener(FoocketingEntryCompleteEvent.class)
    public void completeEventHandler(FoocketingEntryCompleteEvent event) {
        Integer foocketingId = event.getPayload().getFoocketingId();
        Integer userId = event.getPayload().getUserId();
        Foocketing foocketing = repository.findById(foocketingId).orElse(null);

        if (foocketing == null) {
            log.error("Entry 단계에서 검증되었으나 존재하지 않는 푸켓팅?? : {}", event.getPayload().getFoocketingId());
            return;
        }

        Integer rank = logRepository.findUserRank(foocketingId, userId);

        if (rank == null || rank > foocketing.getFoocketingAmount()) {
            return;
        }

        Shop shop = foocketing.getMenu().getShop();
        User user = userRepository.findById(event.getPayload().getUserId())
                .orElse(null);

        if (user == null) {
            log.error("Entry 단계에서 검증되었으나 존재하지 않는 사용자?? : {}", event.getPayload().getUserId());
            return;
        }

        FoocketingTransaction transaction = new FoocketingTransaction();
        // transaction.setTransactionStatus(TransactionStatus.PREPARING_FOOD);
        // 시연용: 승인대기(PENDING_APPROVAL)이 아닌 바로 픽업대기(WAITING_PICKUP)로 전환.
        transaction.setTransactionStatus(TransactionStatus.WAITING_PICKUP);
        transaction.setShop(shop);
        transaction.setFoocketing(foocketing);
        transaction.setUser(user);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);

        // QR 코드 생성 및 저장
        generateAndUploadQrCode(transaction);
    }

    /**
     * QR 코드를 생성하고 S3에 업로드한 후 FoocketingTransaction에 fileKey 저장
     *
     * @param transaction 푸켓팅 트랜잭션
     */
    private void generateAndUploadQrCode(FoocketingTransaction transaction) {
        try {
            log.info("QR 코드 생성 시작 - Transaction ID: {}", transaction.getTransactionId());

            // QR 코드에 포함될 URL 생성
            String pickupUrl = String.format("%s?type=%s&id=%d",
                    qrReceiptConfirmBaseUrl,
                    "foocketing",
                    transaction.getTransactionId());

            // QR 코드 이미지 생성
            byte[] qrCodeData = qrCodeService.generateQrCode(pickupUrl);

            // QR 코드 파일명 생성
            String fileName = qrCodeService.generateQrCodeFileName(
                    transaction.getTransactionId(),
                    "foocketing");

            // S3에 업로드 (fileKey 반환)
            String fileKey = s3Service.uploadFile(
                    qrCodeData,
                    fileName,
                    "image/png",
                    "qr-codes/");

            // 트랜잭션에 QR 코드 fileKey 저장
            transaction.setTransactionQrImage(fileKey);
            transactionRepository.save(transaction);

            log.info("QR 코드 생성 및 업로드 완료 - fileKey: {}", fileKey);

        } catch (Exception e) {
            log.error("QR 코드 생성 및 업로드 실패 - Transaction ID: {}",
                    transaction.getTransactionId(), e);
            // QR 코드 생성 실패가 트랜잭션 생성을 막지 않도록 예외를 던지지 않음
            // 필요시 알림이나 재시도 로직 추가 가능
        }
    }
}
