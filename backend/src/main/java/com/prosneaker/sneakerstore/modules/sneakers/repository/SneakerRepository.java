package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SneakerRepository extends JpaRepository<Sneaker, UUID>, JpaSpecificationExecutor<Sneaker> {

    @Query("""
            SELECT DISTINCT s FROM Sneaker s
            LEFT JOIN FETCH s.category
            LEFT JOIN FETCH s.images
            WHERE s.id = :id
            """)
    Optional<Sneaker> findByIdWithDetails(@Param("id") UUID id);
}
