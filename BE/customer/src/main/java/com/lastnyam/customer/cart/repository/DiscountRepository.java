package com.lastnyam.customer.cart.repository;

import com.lastnyam.database.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepository extends JpaRepository<Discount, Integer> {
}

