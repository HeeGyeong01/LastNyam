package com.lastnyam.foocketingsubscriber.service;

import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.FoocketingLog;
import com.lastnyam.database.entity.User;
import com.lastnyam.foocketingsubscriber.dto.FoocketingEntryPayload;
import com.lastnyam.foocketingsubscriber.exception.FoocketingEntryException;
import com.lastnyam.foocketingsubscriber.repository.FoocketingLogRepository;
import com.lastnyam.foocketingsubscriber.repository.FoocketingRepository;
import com.lastnyam.foocketingsubscriber.repository.UserRepository;
import com.lastnyam.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
    public void processFoocketingEntry(FoocketingEntryPayload entry) {
        Foocketing foocketing = foocketingRepository.findById(entry.getFoocketingId())
                .orElse(null);

        if(foocketing == null){
            throw new FoocketingEntryException("존재하지 않는 푸켓팅입니다.",400);
        }

        User user = userRepository.findById(entry.getUserId()).orElse(null);

        if(user == null){
            throw new FoocketingEntryException("존재하지 않는 사용자입니다.",400);
        }

        Integer currentRank = getCurrentRank(entry.getFoocketingId());

        if(currentRank == null){
            currentRank = 1;
        }

        FoocketingLog log = FoocketingLog.builder()
                .foocketing(foocketing)
                .logUserRank(currentRank)
                .user(user)
                .build();

        saveRank(entry.getFoocketingId(),currentRank + 1);
        logRepository.save(log);
    }

    private void saveRank(Integer foocketingId,Integer nextRank){
        redisService.add(ID_PREFIX + foocketingId , nextRank);
    }

    private Integer getCurrentRank(Integer foocketingId){
        return (Integer) redisService.get(ID_PREFIX + foocketingId);
    }
}
