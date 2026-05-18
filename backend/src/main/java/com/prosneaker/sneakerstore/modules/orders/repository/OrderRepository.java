package com.prosneaker.sneakerstore.modules.orders.repository;

import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("""
            SELECT o FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id AND o.user.id = :userId
            """)
    Optional<Order> findByIdAndUserIdWithItems(UUID id, UUID userId);

    @Query("""
            SELECT o FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id
            """)
    Optional<Order> findByIdWithItems(UUID id);

    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
