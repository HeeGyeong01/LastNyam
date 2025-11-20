package com.lastnyam.owner.shop.repository;

import com.lastnyam.database.entity.Menu;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuRepository extends JpaRepository<Menu, Integer> {

    @Query("SELECT m FROM Menu m " +
            "JOIN FETCH m.foodCategory fc " +
            "WHERE m.shop.shopId = :shopId " +
            "ORDER BY m.menuId ASC")
    List<Menu> findByShopId(@Param("shopId") Integer shopId);

    List<Menu> findByMenuIdIn(Collection<Integer> menuIds);
}




