package com.lastnyam.owner.report.repository;

import com.lastnyam.database.entity.MenuStatistics;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.owner.report.dto.ReportResponse.MenuStats;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuStatRepository extends JpaRepository<MenuStatistics, Long> {

    @Query("""
            SELECT new com.lastnyam.owner.report.dto.ReportResponse$MenuStats(m.menuName,m.menuPrice,ms.statisticsSoldCount,ms.statisticsRegisterCount,ms.statisticsWeeklySold,ms.statisticsWeeklyRegister,ms.statisticsWeeklyFoocketingView,ms.statisticsWeeklyFoocketingEntry)
            FROM MenuStatistics ms
            JOIN ms.menu m
            WHERE ms.shopId = :shopId
            """)
    List<MenuStats> getStats(Integer shopId);


    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE MenuStatistics ms
            SET ms.statisticsWeeklySold = 0, ms.statisticsWeeklyRegister = 0, ms.statisticsWeeklyFoocketingView = 0, ms.statisticsWeeklyFoocketingEntry = 0
            """)
    int initializeStats();

    @Query("""
            SELECT DISTINCT s
            FROM MenuStatistics ms
            JOIN Shop s on ms.shopId = s.shopId
            WHERE ms.statisticsWeeklyRegister > 0
            """)
    Set<Shop> getTargetIds();
}
