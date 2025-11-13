package com.lastnyam.customer.cart.repository;

import com.lastnyam.database.entity.DiscountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscountTransactionRepository extends JpaRepository<DiscountTransaction, Integer> {
    List<DiscountTransaction> findByUserUserId(Integer userId);
}


