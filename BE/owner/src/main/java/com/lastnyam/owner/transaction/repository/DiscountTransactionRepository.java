package com.lastnyam.owner.transaction.repository;

import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiscountTransactionRepository extends JpaRepository<DiscountTransaction, Integer> {
    
    @Query("SELECT dt FROM DiscountTransaction dt " +
           "JOIN FETCH dt.user u " +
           "JOIN FETCH dt.shop s " +
           "WHERE dt.transactionId = :transactionId")
    Optional<DiscountTransaction> findByIdWithDetails(@Param("transactionId") Integer transactionId);
    
    @Query("SELECT dt FROM DiscountTransaction dt " +
           "JOIN FETCH dt.shop s " +
           "WHERE s.shopId = :shopId " +
           "AND dt.transactionStatus NOT IN :excludedStatuses " +
           "ORDER BY dt.createdAt DESC")
    List<DiscountTransaction> findByShopIdAndStatusNotIn(@Param("shopId") Integer shopId,
                                                          @Param("excludedStatuses") List<TransactionStatus> excludedStatuses);
}




