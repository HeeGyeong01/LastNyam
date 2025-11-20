package com.lastnyam.foocketingsubscriber.service;

import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.FoocketingLog;
import com.lastnyam.database.entity.User;
import com.lastnyam.foocketingsubscriber.event.FoocketingEntryCompleteEvent;
import com.lastnyam.foocketingsubscriber.exception.FoocketingEntryErrorCode;
import com.lastnyam.foocketingsubscriber.exception.FoocketingEntryException;
import com.lastnyam.foocketingsubscriber.repository.FoocketingLogRepository;
import com.lastnyam.foocketingsubscriber.repository.FoocketingRepository;
import com.lastnyam.foocketingsubscriber.repository.UserRepository;
import com.lastnyam.messaging.dto.FoocketingEntryPayload;
import com.lastnyam.redis.service.RedisService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class FoocketingLogService {

    private static final String ID_PREFIX = "Foocketing-id:";

    private final FoocketingLogRepository logRepository;
    private final RedisService redisService;
    private final FoocketingRepository foocketingRepository;
    private final UserRepository userRepository;
    private final DailyStatisticsService dailyStatisticsService;

    private final ApplicationEventPublisher eventPublisher;

    private final MetricService metricService;

    @Transactional
    public void processFoocketingEntry(FoocketingEntryPayload entry) {

        Integer foocketingId = entry.getFoocketingId();
        Integer userId = entry.getUserId();

        if (logRepository.existsByFoocketing_FoocketingIdAndUser_UserId(foocketingId, userId)) {
            return;
        }

        Foocketing foocketing = foocketingRepository.findById(foocketingId)
                .orElse(null);

        if (foocketing == null) {
            throw new FoocketingEntryException(FoocketingEntryErrorCode.FOOCKETING_NOT_FOUND);
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            throw new FoocketingEntryException(FoocketingEntryErrorCode.USER_NOT_FOUND);
        }

        Integer currentRank = increaseRank(entry.getFoocketingId());

        FoocketingLog foocketingLog = FoocketingLog.builder()
                .foocketing(foocketing)
                .logUserRank(currentRank)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        logRepository.save(foocketingLog);

        // 일자별 통계 업데이트 (푸켓팅 참여 수 증가)
        try {
            Integer shopId = foocketing.getMenu().getShop().getShopId();
            dailyStatisticsService.incrementFoocketingCount(shopId);
        } catch (Exception e) {
            log.warn("일자별 통계 업데이트 실패 - shopId: {}, error: {}",
                    foocketing.getMenu().getShop().getShopId(), e.getMessage());
        }

        eventPublisher.publishEvent(new FoocketingEntryCompleteEvent(entry));
        metricService.incrementParticipantOf(entry.getFoocketingId());
    }

    private Integer increaseRank(Integer foocketingId) {
        String key = ID_PREFIX + foocketingId;
        Long rank = redisService.incr(key);
        return Math.toIntExact(rank);
    }

    private Integer getCurrentRank(Integer foocketingId) {
        return (Integer) redisService.get(ID_PREFIX + foocketingId);
    }
}
