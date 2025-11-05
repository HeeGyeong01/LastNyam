package com.lastnyam.owner.repository;

import com.lastnyam.database.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Integer> {

    Optional<Owner> findByOwnerEmail(String email);

    boolean existsByOwnerEmail(String email);
}
