package com.lastnyam.owner.transaction.repository;

import com.lastnyam.database.entity.DiscountTransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiscountTransactionItemRepository extends JpaRepository<DiscountTransactionItem, Integer> {
    
    @Query("SELECT dti FROM DiscountTransactionItem dti " +
           "JOIN FETCH dti.discount d " +
           "JOIN FETCH d.menu m " +
           "WHERE dti.discountTransaction.transactionId = :transactionId")
    List<DiscountTransactionItem> findByTransactionId(@Param("transactionId") Integer transactionId);
    
    @Query("SELECT dti FROM DiscountTransactionItem dti " +
           "JOIN FETCH dti.discount d " +
           "JOIN FETCH d.menu m " +
           "WHERE dti.discountTransaction.transactionId IN :transactionIds")
    List<DiscountTransactionItem> findByTransactionIdIn(@Param("transactionIds") List<Integer> transactionIds);
}

