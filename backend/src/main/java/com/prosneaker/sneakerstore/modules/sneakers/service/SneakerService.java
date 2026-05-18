package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.sneakers.dto.CreateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.UpdateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerSize;
import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SneakerService {

    private final SneakerRepository sneakerRepository;
    private final SneakerSizeRepository sneakerSizeRepository;
    private final SneakerMapper sneakerMapper;

    @Transactional(readOnly = true)
    public PageResponse<SneakerResponse> search(String brand, String category, String search, Pageable pageable) {
        return PageMapper.toPageResponse(
                sneakerRepository.searchActive(brand, category, search, pageable),
                sneaker -> toResponseWithSizes(sneaker.getId()));
    }

    @Transactional(readOnly = true)
    public SneakerResponse getById(UUID id) {
        Sneaker sneaker = findActiveSneaker(id);
        return toResponseWithSizes(sneaker.getId());
    }

    @Transactional
    public SneakerResponse create(CreateSneakerRequest request) {
        Sneaker sneaker = Sneaker.builder()
                .brand(request.getBrand().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory().trim())
                .color(request.getColor().trim())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();

        sneaker = sneakerRepository.save(sneaker);

        int totalStock = 0;
        for (CreateSneakerRequest.SizeStockRequest sizeRequest : request.getSizes()) {
            SneakerSize size = SneakerSize.builder()
                    .sneaker(sneaker)
                    .sizeValue(sizeRequest.getSizeValue())
                    .stock(sizeRequest.getStock())
                    .build();
            sneakerSizeRepository.save(size);
            totalStock += sizeRequest.getStock();
        }

        sneaker.setStock(totalStock);
        sneakerRepository.save(sneaker);

        return toResponseWithSizes(sneaker.getId());
    }

    @Transactional
    public SneakerResponse update(UUID id, UpdateSneakerRequest request) {
        Sneaker sneaker = findSneaker(id);

        if (request.getBrand() != null) {
            sneaker.setBrand(request.getBrand().trim());
        }
        if (request.getName() != null) {
            sneaker.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            sneaker.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            sneaker.setPrice(request.getPrice());
        }
        if (request.getCategory() != null) {
            sneaker.setCategory(request.getCategory().trim());
        }
        if (request.getColor() != null) {
            sneaker.setColor(request.getColor().trim());
        }
        if (request.getImageUrl() != null) {
            sneaker.setImageUrl(request.getImageUrl());
        }
        if (request.getActive() != null) {
            sneaker.setActive(request.getActive());
        }

        sneakerRepository.save(sneaker);
        return toResponseWithSizes(sneaker.getId());
    }

    @Transactional
    public void delete(UUID id) {
        Sneaker sneaker = findSneaker(id);
        sneaker.setActive(false);
        sneakerRepository.save(sneaker);
    }

    public Sneaker findActiveSneaker(UUID id) {
        Sneaker sneaker = findSneaker(id);
        if (!sneaker.isActive()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found");
        }
        return sneaker;
    }

    public Sneaker findSneaker(UUID id) {
        return sneakerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));
    }

    public SneakerSize findSize(UUID sneakerId, double sizeValue) {
        return sneakerSizeRepository.findBySneakerIdAndSizeValue(sneakerId, sizeValue)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Size not available for this sneaker"));
    }

    private SneakerResponse toResponseWithSizes(UUID sneakerId) {
        Sneaker sneaker = findSneaker(sneakerId);
        return sneakerMapper.toResponse(sneaker, sneakerSizeRepository.findBySneakerId(sneakerId));
    }
}
