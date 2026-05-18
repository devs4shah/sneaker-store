package com.prosneaker.sneakerstore.modules.cart.repository;

import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCartIdAndSneakerIdAndSizeValue(UUID cartId, UUID sneakerId, double sizeValue);
}
