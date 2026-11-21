package com.CMS.repository;

import com.CMS.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndUserIdNot(String email, Long userId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE " +
           "(:query IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY u.userId ASC")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role ORDER BY u.userId ASC")
    List<User> findAllWithRole();
}