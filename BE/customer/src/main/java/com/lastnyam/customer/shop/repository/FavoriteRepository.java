package com.lastnyam.customer.shop.repository;

import com.lastnyam.database.entity.Favorite;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {

    boolean existsByUserUserIdAndShopShopId(Integer userId, Integer shopId);

    Optional<Favorite> findByUserUserIdAndShopShopId(Integer userId, Integer shopId);
}


