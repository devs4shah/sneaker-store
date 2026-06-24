package com.prosneaker.sneakerstore.modules.wishlist.repository;

import com.prosneaker.sneakerstore.modules.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {

    boolean existsByUser_IdAndSneaker_Id(UUID userId, UUID sneakerId);

    Optional<WishlistItem> findByUser_IdAndSneaker_Id(UUID userId, UUID sneakerId);

    @Query("""
            SELECT DISTINCT w FROM WishlistItem w
            JOIN FETCH w.sneaker s
            LEFT JOIN FETCH s.category
            LEFT JOIN FETCH s.images
            WHERE w.user.id = :userId
            ORDER BY w.createdAt DESC
            """)
    List<WishlistItem> findAllByUserIdWithSneakerDetails(@Param("userId") UUID userId);

    long countByUser_Id(UUID userId);
}
