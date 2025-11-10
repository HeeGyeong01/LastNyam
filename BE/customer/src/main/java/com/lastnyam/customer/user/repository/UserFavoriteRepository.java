package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.UserFavorite;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Integer> {

    // 특정 사용자의 선호 카테고리 조회 
    List<UserFavorite> findByUserUserId(Integer userId);

    // 특정 사용자의 선호 카테고리 ID만 조회 
    @Query("SELECT uf.foodCategory.categoryId FROM UserFavorite uf WHERE uf.user.userId = :userId")
    List<Integer> findCategoryIdsByUserId(@Param("userId") Integer userId);


} 
