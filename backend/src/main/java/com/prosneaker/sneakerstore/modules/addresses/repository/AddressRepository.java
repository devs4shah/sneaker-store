package com.prosneaker.sneakerstore.modules.addresses.repository;

import com.prosneaker.sneakerstore.modules.addresses.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUser_IdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    Optional<Address> findByIdAndUser_Id(UUID id, UUID userId);

    long countByUser_Id(UUID userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void clearDefaultForUser(@Param("userId") UUID userId);

    Optional<Address> findFirstByUser_IdOrderByCreatedAtAsc(UUID userId);
}
