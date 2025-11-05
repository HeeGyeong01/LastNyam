package com.lastnyam.owner.shop.repository;

import com.lastnyam.database.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Integer> {
    Optional<FoodCategory> findByCategoryName(String categoryName);
}




