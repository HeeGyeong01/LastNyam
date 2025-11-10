package com.lastnyam.foocketingsubscriber.repository;

import com.lastnyam.database.entity.FoocketingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoocketingLogRepository extends JpaRepository<FoocketingLog,Integer> {

}
