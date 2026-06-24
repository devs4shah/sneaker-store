package com.prosneaker.sneakerstore.modules.coupons.repository;

import com.prosneaker.sneakerstore.modules.coupons.entity.Coupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Coupon c WHERE c.id = :id")
    Optional<Coupon> findByIdForUpdate(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Coupon c WHERE UPPER(c.code) = UPPER(:code)")
    Optional<Coupon> findByCodeForUpdate(@Param("code") String code);

    @Query("""
            SELECT c FROM Coupon c
            WHERE c.active = true
              AND c.validFrom <= :now
              AND c.validUntil >= :now
              AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)
            ORDER BY c.code ASC
            """)
    List<Coupon> findCurrentlyAvailableCoupons(@Param("now") Instant now);
}
