package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SneakerSizeRepository extends JpaRepository<SneakerSize, UUID> {

    List<SneakerSize> findBySneakerId(UUID sneakerId);

    Optional<SneakerSize> findBySneakerIdAndSizeValue(UUID sneakerId, double sizeValue);
}
