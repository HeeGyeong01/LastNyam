package com.lastnyam.customer.shop.repository;

import com.lastnyam.database.entity.Foocketing;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoocketingRepository extends JpaRepository<Foocketing, Integer> {

    List<Foocketing> findByMenu_Shop_ShopIdAndFoocketingTimeAfter(Integer shopId, LocalDateTime now);
}



