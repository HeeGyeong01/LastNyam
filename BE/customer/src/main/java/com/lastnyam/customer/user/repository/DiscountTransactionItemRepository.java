package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.DiscountTransactionItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DiscountTransactionItemRepository extends JpaRepository<DiscountTransactionItem, Integer> {

    /**
     * 특정 거래의 모든 아이템 조회 (할인 정보와 메뉴 정보 포함)
     */
    @Query("SELECT dti FROM DiscountTransactionItem dti " +
            "JOIN FETCH dti.discount d " +
            "JOIN FETCH d.menu m " +
            "WHERE dti.discountTransaction.transactionId = :transactionId")
    List<DiscountTransactionItem> findAllByTransactionIdWithDiscountAndMenu(
            @Param("transactionId") Integer transactionId);
}
