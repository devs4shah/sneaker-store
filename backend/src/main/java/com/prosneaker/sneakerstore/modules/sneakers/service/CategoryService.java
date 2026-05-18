package com.prosneaker.sneakerstore.modules.sneakers.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.sneakers.dto.CategoryResponse;
import com.prosneaker.sneakerstore.modules.sneakers.dto.CreateCategoryRequest;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Category;
import com.prosneaker.sneakerstore.modules.sneakers.mapper.SneakerMapper;
import com.prosneaker.sneakerstore.modules.sneakers.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SneakerMapper sneakerMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(sneakerMapper::toCategoryResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Category already exists");
        }

        Category category = Category.builder().name(name).build();
        return sneakerMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Category not found"));
    }
}
