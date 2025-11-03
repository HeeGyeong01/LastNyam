package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "foocketings")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Foocketing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "foocketing_id")
    private Integer foocketingId;
    
    @Column(name = "foocketing_time", nullable = false)
    private LocalDateTime foocketingTime;
    
    @Column(name = "foocketing_amount", nullable = false)
    private Integer foocketingAmount;

    @Column(name = "foocketing_close_time", nullable = false)
    private LocalDateTime foocketingCloseTime;

    @Column(name = "foocketing_pickup_end_time", nullable = false)
    private LocalDateTime foocketingPickupEndTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private Menu menu;
    
    @OneToMany(mappedBy = "foocketing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FoocketingTransaction> foocketingTransactions;
    
    @OneToMany(mappedBy = "foocketing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FoocketingLog> foocketingLogs;
}
