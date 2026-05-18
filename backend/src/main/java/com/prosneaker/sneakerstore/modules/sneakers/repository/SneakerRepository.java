package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface SneakerRepository extends JpaRepository<Sneaker, UUID> {

    @Query("""
            SELECT s FROM Sneaker s
            WHERE s.active = true
            AND (:brand IS NULL OR LOWER(s.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
            AND (:category IS NULL OR LOWER(s.category) = LOWER(:category))
            AND (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(s.brand) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Sneaker> searchActive(String brand, String category, String search, Pageable pageable);
}
