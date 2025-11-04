package com.lastnyam.owner.transaction.repository;

import com.lastnyam.database.entity.FoocketingTransaction;
import com.lastnyam.database.entity.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FoocketingTransactionRepository extends JpaRepository<FoocketingTransaction, Integer> {
    
    @Query("SELECT ft FROM FoocketingTransaction ft " +
           "JOIN FETCH ft.user u " +
           "JOIN FETCH ft.shop s " +
           "JOIN FETCH ft.foocketing f " +
           "JOIN FETCH f.menu m " +
           "WHERE ft.transactionId = :transactionId")
    Optional<FoocketingTransaction> findByIdWithDetails(@Param("transactionId") Integer transactionId);
    
    @Query("SELECT ft FROM FoocketingTransaction ft " +
           "JOIN FETCH ft.shop s " +
           "JOIN FETCH ft.foocketing f " +
           "JOIN FETCH f.menu m " +
           "WHERE s.shopId = :shopId " +
           "AND ft.transactionStatus NOT IN :excludedStatuses " +
           "ORDER BY ft.createdAt DESC")
    List<FoocketingTransaction> findByShopIdAndStatusNotIn(@Param("shopId") Integer shopId,
                                                            @Param("excludedStatuses") List<TransactionStatus> excludedStatuses);
}




