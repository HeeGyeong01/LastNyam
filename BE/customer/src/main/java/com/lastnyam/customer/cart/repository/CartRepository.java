package com.lastnyam.customer.cart.repository;

import com.lastnyam.database.entity.Cart;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    Optional<Cart> findByUserUserId(Integer userId);
}

