package com.lastnyam.customer.stats.service;

import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.stats.dto.FootstepResponse;
import com.lastnyam.customer.stats.repository.StatisticsRepository;
import com.lastnyam.database.entity.Statistics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;

    /**
     * 가장 최근 탄소발자국 통계 조회
     *
     * @return 최근 통계 정보
     */
    @Transactional(readOnly = true)
    public FootstepResponse getLatestFootstep() {
        log.info("가장 최근 탄소발자국 통계 조회");

        Statistics latestStats = statisticsRepository.findLatest()
                .orElseThrow(() -> ResourceNotFoundException.ofStatistics());

        return FootstepResponse.from(latestStats);
    }
}
