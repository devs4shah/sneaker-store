package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.sneakers.dto.CreateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.dto.SneakerResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.UpdateSneakerRequest;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Category;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerSpecification;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SneakerService {

    private final SneakerRepository sneakerRepository;
    private final CategoryService categoryService;
    private final SneakerMapper sneakerMapper;
    private final LocalImageStorageService localImageStorageService;

    @Transactional(readOnly = true)
    public PageResponse<SneakerResponse> search(
            String search,
            String brand,
            UUID categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {

        validatePriceRange(minPrice, maxPrice);

        Specification<Sneaker> spec = Specification
                .where(SneakerSpecification.fetchDetails())
                .and(SneakerSpecification.withName(search))
                .and(SneakerSpecification.withBrand(brand))
                .and(SneakerSpecification.withCategoryId(categoryId))
                .and(SneakerSpecification.withMinPrice(minPrice))
                .and(SneakerSpecification.withMaxPrice(maxPrice));

        Page<Sneaker> page = sneakerRepository.findAll(spec, pageable);
        return PageMapper.toPageResponse(page, sneakerMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SneakerResponse getById(UUID id) {
        Sneaker sneaker = findSneakerWithDetails(id);
        return sneakerMapper.toResponse(sneaker);
    }

    @Transactional
    public SneakerResponse create(CreateSneakerRequest request) {
        Category category = categoryService.getCategoryById(request.getCategoryId());

        Sneaker sneaker = Sneaker.builder()
                .name(request.getName().trim())
                .brand(request.getBrand().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .gender(request.getGender())
                .color(request.getColor().trim())
                .size(request.getSize())
                .category(category)
                .build();

        addImages(sneaker, request.getImageUrls());
        return sneakerMapper.toResponse(sneakerRepository.save(sneaker));
    }

    @Transactional
    public SneakerResponse update(UUID id, UpdateSneakerRequest request) {
        Sneaker sneaker = findSneakerWithDetails(id);

        if (request.getName() != null) {
            sneaker.setName(request.getName().trim());
        }
        if (request.getBrand() != null) {
            sneaker.setBrand(request.getBrand().trim());
        }
        if (request.getDescription() != null) {
            sneaker.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            sneaker.setPrice(request.getPrice());
        }
        if (request.getStockQuantity() != null) {
            sneaker.setStockQuantity(request.getStockQuantity());
        }
        if (request.getGender() != null) {
            sneaker.setGender(request.getGender());
        }
        if (request.getColor() != null) {
            sneaker.setColor(request.getColor().trim());
        }
        if (request.getSize() != null) {
            sneaker.setSize(request.getSize());
        }
        if (request.getCategoryId() != null) {
            sneaker.setCategory(categoryService.getCategoryById(request.getCategoryId()));
        }
        if (request.getImageUrls() != null) {
            sneaker.getImages().clear();
            addImages(sneaker, request.getImageUrls());
        }

        return sneakerMapper.toResponse(sneakerRepository.save(sneaker));
    }

    @Transactional
    public void delete(UUID id) {
        Sneaker sneaker = findSneakerWithDetails(id);
        sneaker.getImages().forEach(image -> localImageStorageService.deleteByPublicPath(image.getImageUrl()));
        sneakerRepository.delete(sneaker);
        localImageStorageService.deleteSneakerDirectory(id);
    }

    @Transactional(readOnly = true)
    public Sneaker findSneaker(UUID id) {
        return sneakerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));
    }

    @Transactional(readOnly = true)
    public Sneaker findSneakerWithDetails(UUID id) {
        return sneakerRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));
    }

    private void addImages(Sneaker sneaker, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }
        for (String url : imageUrls) {
            if (url != null && !url.isBlank()) {
                SneakerImage image = SneakerImage.builder()
                        .sneaker(sneaker)
                        .imageUrl(url.trim())
                        .build();
                sneaker.getImages().add(image);
            }
        }
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "minPrice cannot be greater than maxPrice");
        }
    }
}
