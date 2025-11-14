package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.database.entity.FoocketingTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoocketingTransactionRepository extends JpaRepository<FoocketingTransaction, Integer> {
	List<FoocketingTransaction> findByUserUserId(Integer userId);
}


