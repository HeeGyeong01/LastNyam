package com.lastnyam.customer.foocketing.repository;

import com.lastnyam.database.entity.Foocketing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoocketingRepository extends JpaRepository<Foocketing, Integer> {
}
