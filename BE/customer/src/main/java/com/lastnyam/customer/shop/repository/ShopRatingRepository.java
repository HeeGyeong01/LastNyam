package com.lastnyam.customer.shop.repository;

import com.lastnyam.database.entity.ShopRating;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRatingRepository extends JpaRepository<ShopRating, Integer> {

    Optional<ShopRating> findByShop_ShopId(Integer shopId);
}



