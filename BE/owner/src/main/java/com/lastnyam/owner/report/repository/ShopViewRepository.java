package com.lastnyam.owner.report.repository;

import com.lastnyam.database.entity.ShopView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopViewRepository extends JpaRepository<ShopView, Integer> {
    
    ShopView findByShopId(Integer shopId);
}
