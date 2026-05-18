package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.sneakers.dto.ImageUploadResponse;
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
import java.util.List;
import java.util.UUID;

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

        for (MultipartFile file : files) {
            StoredImage stored = localImageStorageService.store(sneakerId, file);

            SneakerImage image = SneakerImage.builder()
                    .sneaker(sneaker)
                    .imageUrl(stored.publicPath())
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

    private SneakerImageResponse toImageResponse(SneakerImage image) {
        return SneakerImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}
