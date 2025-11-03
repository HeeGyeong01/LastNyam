package com.lastnyam.owner.repository;

import com.lastnyam.database.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD

public interface OwnerRepository extends JpaRepository<Owner, Integer> {
=======
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Integer> {
    
    Optional<Owner> findByOwnerEmail(String email);
    
    boolean existsByOwnerEmail(String email);
>>>>>>> BE/f/S13P31A101-42-authentication
}
