package com.lastnyam.owner.shop.repository;

import com.lastnyam.database.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ShopRepository extends JpaRepository<Shop, Integer> {
    
    @Query("SELECT s FROM Shop s " +
           "JOIN FETCH s.foodCategory fc " +
           "WHERE s.owner.ownerId = :ownerId " +
           "ORDER BY s.shopId ASC")
    List<Shop> findByOwnerId(@Param("ownerId") Integer ownerId);
}
