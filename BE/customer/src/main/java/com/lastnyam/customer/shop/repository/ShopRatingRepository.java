package com.lastnyam.customer.shop.repository;

import com.lastnyam.database.entity.ShopRating;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShopRatingRepository extends JpaRepository<ShopRating, Integer> {

    Optional<ShopRating> findByShop_ShopId(Integer shopId);

    @Modifying
    @Query("update ShopRating sr set sr.shopFavoriteCount = sr.shopFavoriteCount + 1 where sr.shop.shopId = :shopId")
    int incrementFavoriteCount(@Param("shopId") Integer shopId);

    @Modifying
    @Query("update ShopRating sr set sr.shopFavoriteCount = sr.shopFavoriteCount - 1 where sr.shop.shopId = :shopId and sr.shopFavoriteCount > 0")
    int decrementFavoriteCount(@Param("shopId") Integer shopId);
}



