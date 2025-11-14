package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.database.entity.FoocketingTransaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FoocketingTransactionRepository extends JpaRepository<FoocketingTransaction, Integer> {
    List<FoocketingTransaction> findByUserUserId(Integer userId);

    /**
     * 특정 사용자의 푸케팅 거래 QR 조회
     */
    @Query("SELECT ft FROM FoocketingTransaction ft " +
            "JOIN FETCH ft.shop s " +
            "WHERE ft.transactionId = :transactionId " +
            "AND ft.user.userId = :userId")
    Optional<FoocketingTransaction> findByIdAndUserId(@Param("transactionId") Integer transactionId,
                                                      @Param("userId") Integer userId);

    /**
     * 특정 사용자의 모든 푸케팅 거래 목록 조회
     */
    @Query("SELECT ft FROM FoocketingTransaction ft " +
            "JOIN FETCH ft.shop s " +
            "JOIN FETCH ft.foocketing f " +
            "JOIN FETCH f.menu m " +
            "WHERE ft.user.userId = :userId " +
            "ORDER BY ft.createdAt DESC")
    List<FoocketingTransaction> findAllByUserIdWithShopAndFoocketing(@Param("userId") Integer userId);
}


