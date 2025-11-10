package com.lastnyam.owner.discount.repository;

import com.lastnyam.database.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DiscountRepository extends JpaRepository<Discount, Integer> {
    
    @Query("SELECT d FROM Discount d " +
           "JOIN FETCH d.menu m " +
           "WHERE m.shop.shopId = :shopId " +
           "AND d.discountDate = :discountDate " +
           "ORDER BY d.discountId ASC")
    List<Discount> findByShopIdAndDiscountDate(@Param("shopId") Integer shopId, @Param("discountDate") LocalDate discountDate);
}




