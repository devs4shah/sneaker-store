package com.prosneaker.sneakerstore.modules.sneakers.repository;

import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.UUID;

public final class SneakerSpecification {

    private SneakerSpecification() {
    }

    public static Specification<Sneaker> fetchDetails() {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            root.fetch("category", JoinType.LEFT);
            root.fetch("images", JoinType.LEFT);
            return cb.conjunction();
        };
    }

    public static Specification<Sneaker> withName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Sneaker> withBrand(String brand) {
        return (root, query, cb) -> {
            if (brand == null || brand.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase());
        };
    }

    public static Specification<Sneaker> withCategoryId(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Sneaker> withMinPrice(BigDecimal minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    public static Specification<Sneaker> withMaxPrice(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }
}
