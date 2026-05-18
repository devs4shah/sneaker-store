package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SneakerImageRepository extends JpaRepository<SneakerImage, UUID> {

    Optional<SneakerImage> findByIdAndSneakerId(UUID imageId, UUID sneakerId);
}
