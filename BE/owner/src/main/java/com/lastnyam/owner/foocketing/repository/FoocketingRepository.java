package com.lastnyam.owner.foocketing.repository;

import com.lastnyam.database.entity.Foocketing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FoocketingRepository extends JpaRepository<Foocketing, Integer> {
    
    @Query("SELECT f FROM Foocketing f " +
           "JOIN FETCH f.menu m " +
           "WHERE m.shop.shopId = :shopId " +
           "AND f.foocketingTime >= :startOfDay " +
           "AND f.foocketingTime < :endOfDay " +
           "ORDER BY f.foocketingTime ASC")
    List<Foocketing> findByShopIdAndToday(@Param("shopId") Integer shopId,
                                           @Param("startOfDay") LocalDateTime startOfDay,
                                           @Param("endOfDay") LocalDateTime endOfDay);
    
    @Query("SELECT f FROM Foocketing f " +
           "JOIN FETCH f.menu m " +
           "WHERE m.shop.shopId = :shopId " +
           "AND f.foocketingPickupEndTime > :currentTime " +
           "ORDER BY f.foocketingTime ASC")
    List<Foocketing> findActiveByShopId(@Param("shopId") Integer shopId, @Param("currentTime") LocalDateTime currentTime);
}




