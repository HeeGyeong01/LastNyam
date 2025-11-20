package com.lastnyam.customer.discount.repository;

import com.lastnyam.database.entity.Discount;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer> {
    List<Discount> findByMenu_Shop_ShopIdAndDiscountCloseTimeAfter(Integer shopId, LocalDateTime now);
}
