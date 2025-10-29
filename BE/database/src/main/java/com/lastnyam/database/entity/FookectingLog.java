package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "fookecting_log")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FookectingLog {
    
    @Id
    @Column(name = "log_id")
    private Integer logId;
    
    @Column(name = "log_user_rank", nullable = false)
    private Integer logUserRank;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "fookecting_id", nullable = false)
    private Integer fookectingId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fookecting_id", insertable = false, updatable = false)
    private Fookecting fookecting;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
