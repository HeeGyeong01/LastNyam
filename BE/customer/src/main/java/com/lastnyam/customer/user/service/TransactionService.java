package com.lastnyam.customer.user.service;

import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.user.dto.TransactionQrResponse;
import com.lastnyam.customer.user.repository.DiscountTransactionRepository;
import com.lastnyam.customer.user.repository.FoocketingTransactionRepository;
import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.FoocketingTransaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final DiscountTransactionRepository discountTransactionRepository;
    private final FoocketingTransactionRepository foocketingTransactionRepository;

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
                .orElseThrow(() -> ResourceNotFoundException.ofTransaction());

        log.info("마감할인 QR 조회: userId={}, transactionId={}", userId, transactionId);

        return TransactionQrResponse.fromDiscount(transaction);
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
                .orElseThrow(() -> ResourceNotFoundException.ofTransaction());

        log.info("푸케팅 QR 조회: userId={}, transactionId={}", userId, transactionId);

        return TransactionQrResponse.fromFoocketing(transaction);
    }
}
