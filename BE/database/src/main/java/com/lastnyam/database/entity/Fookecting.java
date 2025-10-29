package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fookectings")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fookecting {
    
    @Id
    @Column(name = "fookecting_id")
    private Integer fookectingId;
    
    @Column(name = "fookecting_time", nullable = false)
    private LocalDateTime fookectingTime;
    
    @Column(name = "foocketing_amount", nullable = false)
    private Integer fookectingAmount;
    
    @Column(name = "menu_id", nullable = false)
    private Integer menuId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", insertable = false, updatable = false)
    private Menu menu;
    
    @OneToMany(mappedBy = "fookecting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FookectingTransaction> fookectingTransactions;
    
    @OneToMany(mappedBy = "fookecting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FookectingLog> fookectingLogs;
}
