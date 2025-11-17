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
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        transaction.setTransactionStatus(TransactionStatus.PREPARING_FOOD);
        transaction.setShop(shop);
        transaction.setFoocketing(foocketing);
        transaction.setUser(user);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}
