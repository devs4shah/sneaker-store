package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.coupons.entity.Coupon;
import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import com.prosneaker.sneakerstore.modules.coupons.repository.CouponRepository;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.repository.CategoryRepository;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService;
import com.prosneaker.sneakerstore.modules.users.entity.Role;
import com.prosneaker.sneakerstore.modules.users.repository.UserRepository;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@prosneaker.com";
    private static final String ADMIN_PASSWORD = "Admin@12345";
    private static final String CLEANUP_MARKER = ".seeded_sneakers_removed_v1";
    private static final String LEGACY_SEED_MARKER = ".dummy_sneakers_seeded_once";

    private static final Set<String> SEEDED_SNEAKER_NAMES = Set.of(
            "Air Max Pulse",
            "Classic Leather",
            "Runner Pro",
            "Street Sprint",
            "Cloud Step",
            "Classic City",
            "Urban Wave",
            "Trail Breeze",
            "Flex Trainer",
            "Sport Pulse",
            "Daily Drift",
            "Metro Lace",
            "Street Classic",
            "AirLite Runner",
            "Dummy Sneaker 1",
            "Dummy Sneaker 2",
            "Dummy Sneaker 3",
            "Dummy Sneaker 4",
            "Dummy Sneaker 5"
    );

    private static final Set<String> SEEDED_CATEGORY_NAMES = Set.of("Running", "Lifestyle");

    private final UserRepository userRepository;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    private final SneakerRepository sneakerRepository;
    private final CouponRepository couponRepository;
    private final ImageStorageProperties imageStorageProperties;
    private final LocalImageStorageService localImageStorageService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        purgeSeededSneakersOnce();

        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userService.createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "System", "Administrator", Role.ROLE_ADMIN);
            log.info("Default admin user created: {}", ADMIN_EMAIL);
        }

        seedCouponsIfMissing();
    }

    private void purgeSeededSneakersOnce() {
        Path uploadDir = Path.of(imageStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        Path marker = uploadDir.resolve(CLEANUP_MARKER);
        if (Files.exists(marker)) {
            return;
        }

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.warn("Could not create upload directory for cleanup marker: {}", e.getMessage());
        }

        List<Sneaker> seededSneakers = sneakerRepository.findAll().stream()
                .filter(this::isSeededSneaker)
                .toList();

        int removed = 0;
        int skipped = 0;

        for (Sneaker sneaker : seededSneakers) {
            if (isReferencedByOrders(sneaker.getId())) {
                log.warn("Skipping seeded sneaker '{}' — referenced by existing orders", sneaker.getName());
                skipped++;
                continue;
            }

            removeSneakerReferences(sneaker.getId());
            try {
                localImageStorageService.deleteSneakerDirectory(sneaker.getId());
            } catch (Exception ex) {
                log.warn("Failed deleting upload directory for sneaker {}: {}", sneaker.getId(), ex.getMessage());
            }
            sneakerRepository.delete(sneaker);
            removed++;
        }

        removeEmptySeededCategories();

        try {
            Files.deleteIfExists(uploadDir.resolve(LEGACY_SEED_MARKER));
            Files.createFile(marker);
        } catch (IOException e) {
            log.warn("Failed writing cleanup marker {}: {}", marker, e.getMessage());
        }

        log.info("Seeded sneaker cleanup complete: removed {}, skipped (order history) {}", removed, skipped);
    }

    private boolean isSeededSneaker(Sneaker sneaker) {
        if (SEEDED_SNEAKER_NAMES.contains(sneaker.getName())) {
            return true;
        }
        return "DummyBrand".equalsIgnoreCase(sneaker.getBrand());
    }

    private boolean isReferencedByOrders(UUID sneakerId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM order_items WHERE sneaker_id = ?",
                Long.class,
                sneakerId);
        return count != null && count > 0;
    }

    private void removeSneakerReferences(UUID sneakerId) {
        jdbcTemplate.update("DELETE FROM reviews WHERE sneaker_id = ?", sneakerId);
        jdbcTemplate.update("DELETE FROM wishlist_items WHERE sneaker_id = ?", sneakerId);
        jdbcTemplate.update("DELETE FROM cart_items WHERE sneaker_id = ?", sneakerId);
    }

    private void removeEmptySeededCategories() {
        for (String categoryName : SEEDED_CATEGORY_NAMES) {
            categoryRepository.findByNameIgnoreCase(categoryName).ifPresent(category -> {
                if (sneakerRepository.countByCategory_Id(category.getId()) == 0) {
                    categoryRepository.delete(category);
                    log.info("Removed empty seeded category: {}", categoryName);
                }
            });
        }
    }

    private void seedCouponsIfMissing() {
        if (couponRepository.existsByCodeIgnoreCase("WELCOME10")) {
            return;
        }

        Instant now = Instant.now();

        couponRepository.save(Coupon.builder()
                .code("WELCOME10")
                .couponType(CouponType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minimumOrderAmount(BigDecimal.ZERO)
                .maximumDiscount(new BigDecimal("500.00"))
                .usageLimit(100)
                .validFrom(now.minus(1, ChronoUnit.DAYS))
                .validUntil(now.plus(365, ChronoUnit.DAYS))
                .active(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("FLAT50")
                .couponType(CouponType.FIXED)
                .discountValue(new BigDecimal("50.00"))
                .minimumOrderAmount(new BigDecimal("200.00"))
                .usageLimit(null)
                .validFrom(now.minus(1, ChronoUnit.DAYS))
                .validUntil(now.plus(365, ChronoUnit.DAYS))
                .active(true)
                .build());

        log.info("Sample coupons seeded (WELCOME10, FLAT50)");
    }
}
