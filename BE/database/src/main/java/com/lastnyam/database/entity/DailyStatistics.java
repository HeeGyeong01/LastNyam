package com.lastnyam.database.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "daily_statistics",
    uniqueConstraints = @UniqueConstraint(columnNames = {"shop_id", "stat_date"})
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statistics_id")
    private Long statisticsId;

    @Column(name = "shop_id", nullable = false)
    private Integer shopId;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;  // 통계 날짜 (YYYY-MM-DD)

    // 일자별 통계 데이터
    @Column(name = "foocketing_count", nullable = false)
    private Integer foocketingCount;  // 푸켓팅 참여 수

    @Column(name = "view_count", nullable = false)
    private Integer viewCount;  // 조회수

    @Column(name = "order_count", nullable = false)
    private Integer orderCount;  // 주문 건수

    @Column(name = "order_revenue", nullable = false)
    private Integer orderRevenue;  // 주문 금액

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
}

