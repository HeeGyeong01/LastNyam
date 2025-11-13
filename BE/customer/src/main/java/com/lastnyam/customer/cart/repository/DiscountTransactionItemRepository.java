package com.lastnyam.customer.cart.repository;

import com.lastnyam.database.entity.DiscountTransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscountTransactionItemRepository extends JpaRepository<DiscountTransactionItem, Integer> {
    List<DiscountTransactionItem> findByDiscountTransactionIn(java.util.List<com.lastnyam.database.entity.DiscountTransaction> transactions);
}


