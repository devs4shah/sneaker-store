package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.sneakers.dto.ImageUploadResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.ReorderSneakerImagesRequest;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerImageResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerImageRepository;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService.StoredImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SneakerImageService {

    private final SneakerService sneakerService;
    private final SneakerImageRepository sneakerImageRepository;
    private final LocalImageStorageService localImageStorageService;
    private final SneakerMapper sneakerMapper;
    private final ImageStorageProperties imageStorageProperties;

    @Transactional
    public ImageUploadResponse uploadImages(UUID sneakerId, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "At least one image file is required");
        }

        if (files.length > imageStorageProperties.getMaxFilesPerRequest()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Maximum " + imageStorageProperties.getMaxFilesPerRequest() + " images per request");
        }

        Sneaker sneaker = sneakerService.findSneakerWithDetails(sneakerId);
        List<SneakerImageResponse> uploaded = new ArrayList<>();
        int nextOrder = sneaker.getImages().stream()
                .mapToInt(SneakerImage::getDisplayOrder)
                .max()
                .orElse(-1) + 1;

        for (MultipartFile file : files) {
            StoredImage stored = localImageStorageService.store(sneakerId, file);

            SneakerImage image = SneakerImage.builder()
                    .sneaker(sneaker)
                    .imageUrl(stored.publicPath())
                    .displayOrder(nextOrder++)
                    .build();

            image = sneakerImageRepository.save(image);
            sneaker.getImages().add(image);
            uploaded.add(toImageResponse(image));
        }

        return ImageUploadResponse.builder()
                .sneakerId(sneakerId)
                .uploadedCount(uploaded.size())
                .images(uploaded)
                .build();
    }

    @Transactional
    public SneakerResponse deleteImage(UUID sneakerId, UUID imageId) {
        Sneaker sneaker = sneakerService.findSneakerWithDetails(sneakerId);
        SneakerImage image = sneakerImageRepository.findByIdAndSneakerId(imageId, sneakerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Image not found"));

        localImageStorageService.deleteByPublicPath(image.getImageUrl());
        sneaker.getImages().remove(image);
        sneakerImageRepository.delete(image);

        return sneakerMapper.toResponse(sneaker);
    }

    @Transactional
    public SneakerResponse reorderImages(UUID sneakerId, ReorderSneakerImagesRequest request) {
        Sneaker sneaker = sneakerService.findSneakerWithDetails(sneakerId);
        List<SneakerImage> images = sneaker.getImages();

        if (images.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Sneaker has no images to reorder");
        }

        Set<UUID> requestedIds = new HashSet<>(request.getImageIds());
        Set<UUID> existingIds = images.stream().map(SneakerImage::getId).collect(Collectors.toSet());

        if (requestedIds.size() != request.getImageIds().size()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Duplicate image IDs are not allowed");
        }

        if (!requestedIds.equals(existingIds)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Image IDs must match all images for this sneaker");
        }

        Map<UUID, SneakerImage> imagesById = images.stream()
                .collect(Collectors.toMap(SneakerImage::getId, Function.identity()));

        int order = 0;
        for (UUID imageId : request.getImageIds()) {
            SneakerImage image = imagesById.get(imageId);
            image.setDisplayOrder(order++);
            sneakerImageRepository.save(image);
        }

        return sneakerMapper.toResponse(sneaker);
    }

    private SneakerImageResponse toImageResponse(SneakerImage image) {
        return SneakerImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .displayOrder(image.getDisplayOrder())
                .build();
    }
}
