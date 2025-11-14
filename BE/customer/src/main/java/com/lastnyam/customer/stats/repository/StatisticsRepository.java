package com.lastnyam.customer.stats.repository;

import com.lastnyam.database.entity.statistics;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StatisticsRepository extends JpaRepository<statistics, Integer> {

    /**
     * 가장 최근 통계 레코드 조회
     */
    @Query("SELECT s FROM statistics s ORDER BY s.createdAt DESC LIMIT 1")
    Optional<statistics> findLatest();
}
