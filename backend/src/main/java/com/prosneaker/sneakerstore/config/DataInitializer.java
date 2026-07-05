package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
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
import java.nio.file.Files;
import java.nio.file.Path;
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
    private static final String CLEANUP_MARKER = ".dummy_data_removed_v2";
    private static final String LEGACY_SEED_MARKER = ".dummy_sneakers_seeded_once";
    private static final String LEGACY_SNEAKER_CLEANUP_MARKER = ".seeded_sneakers_removed_v1";

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
    private static final Set<String> SEEDED_COUPON_CODES = Set.of("WELCOME10", "FLAT50");

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
        purgeLegacyDummyDataOnce();
        ensureDefaultAdminExists();
    }

    private void ensureDefaultAdminExists() {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userService.createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "System", "Administrator", Role.ROLE_ADMIN);
            log.info("Default admin user created: {}", ADMIN_EMAIL);
        }
    }

    private void purgeLegacyDummyDataOnce() {
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

        purgeLegacyDummySneakers();
        purgeLegacySampleCoupons();
        removeEmptySeededCategories();

        try {
            Files.deleteIfExists(uploadDir.resolve(LEGACY_SEED_MARKER));
            Files.deleteIfExists(uploadDir.resolve(LEGACY_SNEAKER_CLEANUP_MARKER));
            Files.createFile(marker);
        } catch (IOException e) {
            log.warn("Failed writing cleanup marker {}: {}", marker, e.getMessage());
        }
    }

    private void purgeLegacyDummySneakers() {
        List<Sneaker> seededSneakers = sneakerRepository.findAll().stream()
                .filter(this::isSeededSneaker)
                .toList();

        int removed = 0;
        int skipped = 0;

        for (Sneaker sneaker : seededSneakers) {
            if (isReferencedByOrders(sneaker.getId())) {
                log.warn("Skipping legacy dummy sneaker '{}' — referenced by existing orders", sneaker.getName());
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

        if (removed > 0 || skipped > 0) {
            log.info("Legacy dummy sneaker cleanup: removed {}, skipped (order history) {}", removed, skipped);
        }
    }

    private void purgeLegacySampleCoupons() {
        int removed = 0;

        for (String code : SEEDED_COUPON_CODES) {
            var couponOptional = couponRepository.findByCodeIgnoreCase(code);
            if (couponOptional.isEmpty()) {
                continue;
            }

            var coupon = couponOptional.get();
            if (coupon.getUsedCount() > 0) {
                log.warn("Skipping legacy sample coupon '{}' — already used", coupon.getCode());
                continue;
            }

            couponRepository.delete(coupon);
            removed++;
            log.info("Removed legacy sample coupon: {}", coupon.getCode());
        }

        if (removed > 0) {
            log.info("Legacy sample coupon cleanup: removed {}", removed);
        }
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
                    log.info("Removed empty legacy category: {}", categoryName);
                }
            });
        }
    }
}
