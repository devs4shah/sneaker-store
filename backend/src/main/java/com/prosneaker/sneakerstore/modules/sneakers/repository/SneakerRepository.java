package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT DISTINCT s FROM Sneaker s
            LEFT JOIN FETCH s.images
            WHERE s.id = :id
            """)
    Optional<Sneaker> findByIdForUpdate(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT s FROM Sneaker s WHERE s.id = :id")
    Optional<Sneaker> findByIdWithCategory(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"category"})
    @Query(value = "SELECT s FROM Sneaker s",
            countQuery = "SELECT COUNT(s) FROM Sneaker s")
    Page<Sneaker> findAllWithCategory(Pageable pageable);
}
