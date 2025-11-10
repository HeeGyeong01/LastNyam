package com.lastnyam.foocketingsubscriber.repository;

import com.lastnyam.database.entity.Foocketing;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FoocketingRepository extends JpaRepository<Foocketing, Integer> {

    @Query("""
            SELECT COUNT(f.foocketingId)
            FROM Foocketing f
            WHERE f.foocketingTime >= :start AND f.foocketingTime < :end
            """)
    int getFoocketingCountBetween(LocalDateTime start, LocalDateTime end);
}
