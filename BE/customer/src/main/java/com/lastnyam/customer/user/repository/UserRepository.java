package com.lastnyam.customer.user.repository;

import com.lastnyam.database.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
