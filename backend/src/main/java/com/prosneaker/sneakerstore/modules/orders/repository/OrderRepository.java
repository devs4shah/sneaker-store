package com.prosneaker.sneakerstore.modules.orders.repository;

import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    boolean existsByOrderNumber(String orderNumber);

    @Query("""
            SELECT DISTINCT o FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id AND o.user.id = :userId
            """)
    Optional<Order> findByIdAndUserIdWithItems(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("""
            SELECT DISTINCT o FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id
            """)
    Optional<Order> findByIdWithItems(@Param("id") UUID id);

    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("""
            SELECT o FROM Order o
            WHERE (:orderStatus IS NULL OR o.orderStatus = :orderStatus)
              AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)
            ORDER BY o.createdAt DESC
            """)
    Page<Order> findForAdmin(
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items", "items.sneaker"})
    @Query("""
            SELECT DISTINCT o FROM Order o
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.sneaker s
            LEFT JOIN FETCH o.user u
            WHERE o.id = :id
            """)
    Optional<Order> findByIdForAdminDetails(@Param("id") UUID id);
}
