package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    
    /**
     * 소셜 ID로 사용자 조회
     */
    Optional<User> findByUserSocialId(String userSocialId);
}
