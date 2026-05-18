package com.prosneaker.sneakerstore.modules.cart.repository;

import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {

    @Query("""
            SELECT c FROM Cart c
            LEFT JOIN FETCH c.items i
            LEFT JOIN FETCH i.sneaker
            WHERE c.user.id = :userId
            """)
    Optional<Cart> findByUserIdWithItems(UUID userId);
}
