package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.FoocketingTransaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FoocketingTransactionRepository extends JpaRepository<FoocketingTransaction, Integer> {

    /**
     * 특정 사용자의 푸케팅 거래 QR 조회
     */
    @Query("SELECT ft FROM FoocketingTransaction ft " +
            "JOIN FETCH ft.shop s " +
            "WHERE ft.transactionId = :transactionId " +
            "AND ft.user.userId = :userId")
    Optional<FoocketingTransaction> findByIdAndUserId(@Param("transactionId") Integer transactionId,
                                                      @Param("userId") Integer userId);
}
