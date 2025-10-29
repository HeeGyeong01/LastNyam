package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_statistics")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuStatistics {
    
    @Id
    @Column(name = "statistics_id")
    private Integer statisticsId;
    
    @Column(name = "statistics_sold_count", nullable = false)
    private Integer statisticsSoldCount;
    
    @Column(name = "statistics_register_count", nullable = false)
    private Integer statisticsRegisterCount;
    
    @Column(name = "statistics_weekly_sold", nullable = false)
    private Integer statisticsWeeklySold;
    
    @Column(name = "statistics_weekly_register", nullable = false)
    private Integer statisticsWeeklyRegister;
    
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;
    
    @Column(name = "menu_id", nullable = false)
    private Integer menuId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", insertable = false, updatable = false)
    private Menu menu;
}
