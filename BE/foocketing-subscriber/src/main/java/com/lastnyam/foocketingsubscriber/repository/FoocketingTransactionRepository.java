package com.lastnyam.foocketingsubscriber.repository;

import com.lastnyam.database.entity.FoocketingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoocketingTransactionRepository extends JpaRepository<FoocketingTransaction, Integer> {
}
