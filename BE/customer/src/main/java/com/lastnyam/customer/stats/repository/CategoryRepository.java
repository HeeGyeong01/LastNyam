package com.lastnyam.customer.stats.repository;

import com.lastnyam.database.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<FoodCategory, Integer> {
}
