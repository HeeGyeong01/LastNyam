package com.lastnyam.foocketingsubscriber.repository;

import com.lastnyam.database.entity.DailyStatistics;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, Long> {

    Optional<DailyStatistics> findByShopIdAndStatDate(Integer shopId, LocalDate statDate);
}

