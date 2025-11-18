package com.lastnyam.owner.report.repository;

import com.lastnyam.database.entity.DailyStatistics;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, Long> {

    Optional<DailyStatistics> findByShopIdAndStatDate(Integer shopId, LocalDate statDate);

    List<DailyStatistics> findByShopIdAndStatDateBetween(
            Integer shopId, 
            LocalDate startDate, 
            LocalDate endDate
    );

    @Query("SELECT ds FROM DailyStatistics ds WHERE ds.shopId = :shopId AND ds.statDate >= :startDate ORDER BY ds.statDate ASC")
    List<DailyStatistics> findByShopIdAndStatDateAfterOrderByStatDateAsc(
            @Param("shopId") Integer shopId,
            @Param("startDate") LocalDate startDate
    );
}

