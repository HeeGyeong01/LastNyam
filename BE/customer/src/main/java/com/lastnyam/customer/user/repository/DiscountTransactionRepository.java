package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.DiscountTransaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DiscountTransactionRepository extends JpaRepository<DiscountTransaction, Integer> {

    /**
     * 특정 사용자의 마감할인 거래 QR 조회
     */
    @Query("SELECT dt FROM DiscountTransaction dt " +
            "JOIN FETCH dt.shop s " +
            "WHERE dt.transactionId = :transactionId " +
            "AND dt.user.userId = :userId")
    Optional<DiscountTransaction> findByIdAndUserId(@Param("transactionId") Integer transactionId,
                                                    @Param("userId") Integer userId);
}
