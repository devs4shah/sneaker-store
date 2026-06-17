package com.prosneaker.sneakerstore.modules.reviews.repository;

import com.prosneaker.sneakerstore.modules.reviews.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    boolean existsByUser_IdAndSneaker_Id(UUID userId, UUID sneakerId);

    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.user
            JOIN FETCH r.sneaker
            WHERE r.user.id = :userId AND r.sneaker.id = :sneakerId
            """)
    Optional<Review> findByUserIdAndSneakerId(@Param("userId") UUID userId, @Param("sneakerId") UUID sneakerId);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
            SELECT r FROM Review r
            WHERE r.sneaker.id = :sneakerId
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findBySneakerId(@Param("sneakerId") UUID sneakerId, Pageable pageable);

    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.sneaker WHERE r.id = :id")
    Optional<Review> findDetailedById(@Param("id") UUID id);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.sneaker.id = :sneakerId")
    Double getAverageRatingBySneakerId(@Param("sneakerId") UUID sneakerId);

    long countBySneakerId(UUID sneakerId);
}
