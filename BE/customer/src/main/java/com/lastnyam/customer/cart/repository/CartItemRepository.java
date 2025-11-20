package com.lastnyam.customer.cart.repository;

import com.lastnyam.database.entity.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    
    List<CartItem> findByCartCartId(Integer cartId);
    
    List<CartItem> findByCartCartIdOrderByCartItemIdAsc(Integer cartId);

    List<CartItem> findByDiscountDiscountId(Integer discountId);
    
    Optional<CartItem> findByCartCartIdAndDiscountDiscountId(Integer cartId, Integer discountId);
    
    void deleteByCartCartIdAndDiscountDiscountId(Integer cartId, Integer discountId);
    
    Optional<CartItem> findByCartCartIdAndCartItemId(Integer cartId, Integer cartItemId);
    
    void deleteByCartCartIdAndCartItemId(Integer cartId, Integer cartItemId);
}

