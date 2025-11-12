package com.lastnyam.customer.shop.repository;

import com.lastnyam.database.entity.Discount;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountQueryRepository extends JpaRepository<Discount, Integer> {

    List<Discount> findByMenu_Shop_ShopIdAndDiscountCloseTimeAfter(Integer shopId, LocalDateTime now);
}



