package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.coupons.entity.Coupon;
import com.prosneaker.sneakerstore.modules.coupons.entity.CouponType;
import com.prosneaker.sneakerstore.modules.coupons.repository.CouponRepository;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Category;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Gender;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import com.prosneaker.sneakerstore.modules.sneakers.repository.CategoryRepository;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.users.entity.Role;
import com.prosneaker.sneakerstore.modules.users.repository.UserRepository;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@prosneaker.com";
    private static final String ADMIN_PASSWORD = "Admin@12345";
    private static final String EXAMPLE_IMAGE_PREFIX = "https://images.example.com/";
    // Short placeholder to keep DB imageUrl column under limits.
    private static final String PLACEHOLDER_DATA_URL =
            "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='120'%20height='120'%3E%3Crect%20width='120'%20height='120'%20fill='%2327272a'/%3E%3Ctext%20x='60'%20y='66'%20text-anchor='middle'%20dominant-baseline='middle'%20fill='%2371717a'%20font-family='Arial'%20font-size='12'%3ENo%20image%3C/text%3E%3C/svg%3E";

    private final UserRepository userRepository;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    private final SneakerRepository sneakerRepository;
    private final CouponRepository couponRepository;
    private final ImageStorageProperties imageStorageProperties;

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userService.createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "System", "Administrator", Role.ROLE_ADMIN);
            log.info("Default admin user created: {}", ADMIN_EMAIL);
        }

        if (categoryRepository.count() == 0) {
            seedCatalog();
        }

        // Fix dead seed URLs (images.example.com) by replacing them with an existing local upload (if present),
        // or a small data URL placeholder as a fallback.
        fixExampleImageUrls();

        if (!dummySneakerSeedCompleted()) {
            ensureMinimumCatalogSize(12);
        }

        seedCouponsIfMissing();
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

    private boolean dummySneakerSeedCompleted() {
        Path marker = Path.of(imageStorageProperties.getUploadDir())
                .toAbsolutePath()
                .normalize()
                .resolve(OneTimeSneakerImageSeeder.MARKER_FILE_NAME);
        return Files.exists(marker);
    }

    private void seedCatalog() {
        Category running = categoryRepository.save(Category.builder().name("Running").build());
        Category lifestyle = categoryRepository.save(Category.builder().name("Lifestyle").build());

        Sneaker sneaker = Sneaker.builder()
                .name("Air Max Pulse")
                .brand("Nike")
                .description("Responsive cushioning for everyday runs.")
                .price(new BigDecimal("129.99"))
                .stockQuantity(25)
                .gender(Gender.UNISEX)
                .color("Black/White")
                .size(10.0)
                .category(running)
                .build();

        sneaker.getImages().add(SneakerImage.builder()
                .sneaker(sneaker)
                .imageUrl(PLACEHOLDER_DATA_URL)
                .build());

        sneakerRepository.save(sneaker);

        Sneaker sneaker2 = Sneaker.builder()
                .name("Classic Leather")
                .brand("Reebok")
                .description("Timeless lifestyle sneaker.")
                .price(new BigDecimal("89.99"))
                .stockQuantity(40)
                .gender(Gender.MEN)
                .color("White")
                .size(9.5)
                .category(lifestyle)
                .build();

        sneaker2.getImages().addAll(List.of(
                SneakerImage.builder()
                        .sneaker(sneaker2)
                        .imageUrl(PLACEHOLDER_DATA_URL)
                        .build(),
                SneakerImage.builder()
                        .sneaker(sneaker2)
                        .imageUrl(PLACEHOLDER_DATA_URL)
                        .build()));

        sneakerRepository.save(sneaker2);
        log.info("Sample categories and sneakers seeded");
    }

    private void fixExampleImageUrls() {
        // Prefer local uploads if any exist, because they are already served by the backend.
        String localFallback = sneakerRepository.findAll()
                .stream()
                .flatMap(s -> s.getImages().stream())
                .map(SneakerImage::getImageUrl)
                .filter(url -> url != null && url.startsWith("/uploads/"))
                .findFirst()
                .orElse(null);

        final String replacement = localFallback != null ? localFallback : PLACEHOLDER_DATA_URL;
        boolean updatedAny = false;

        for (Sneaker sneaker : sneakerRepository.findAll()) {
            for (SneakerImage image : sneaker.getImages()) {
                String url = image.getImageUrl();
                if (url != null && url.startsWith(EXAMPLE_IMAGE_PREFIX)) {
                    image.setImageUrl(replacement);
                    updatedAny = true;
                }
            }
        }

        if (updatedAny) {
            log.info("Replaced dead example image URLs with local fallback/data URL");
        }
    }

    private void ensureMinimumCatalogSize(int targetCount) {
        if (sneakerRepository.count() >= targetCount) return;

        // If categories are missing for some reason, ensure they exist.
        Category running = categoryRepository.findByNameIgnoreCase("Running")
                .orElseGet(() -> categoryRepository.save(Category.builder().name("Running").build()));
        Category lifestyle = categoryRepository.findByNameIgnoreCase("Lifestyle")
                .orElseGet(() -> categoryRepository.save(Category.builder().name("Lifestyle").build()));

        // Prefer a local upload URL if we already have one; otherwise fall back to a small data URL.
        String imageUrlFallback = sneakerRepository.findAll()
                .stream()
                .flatMap(s -> s.getImages().stream())
                .map(SneakerImage::getImageUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElse(PLACEHOLDER_DATA_URL);

        Set<String> existingNames = new HashSet<>();
        for (Sneaker s : sneakerRepository.findAll()) {
            existingNames.add(s.getName());
        }

        // Seed additional dummy sneakers until we reach `targetCount`.
        // Notes:
        // - We use the same `imageUrlFallback` for all new dummy sneakers to guarantee images render.
        // - We skip names that already exist.
        int additions = 0;
        while (sneakerRepository.count() < targetCount && additions < 30) {
            String name;
            String brand;
            String description;
            Gender gender;
            String color;
            double size;
            BigDecimal price;
            int stockQuantity;
            Category category;

            switch (additions) {
                case 0 -> { name = "Runner Pro"; brand = "Adidas"; description = "Everyday comfort runner."; gender = Gender.UNISEX; color = "Black"; size = 9.0; price = new BigDecimal("99.99"); stockQuantity = 18; category = running; }
                case 1 -> { name = "Street Sprint"; brand = "Puma"; description = "Lightweight street style sneaker."; gender = Gender.MEN; color = "Red"; size = 10.5; price = new BigDecimal("119.49"); stockQuantity = 12; category = running; }
                case 2 -> { name = "Cloud Step"; brand = "Asics"; description = "Soft cushioning for daily miles."; gender = Gender.WOMEN; color = "Blue"; size = 8.0; price = new BigDecimal("79.95"); stockQuantity = 50; category = running; }
                case 3 -> { name = "Classic City"; brand = "Reebok"; description = "A classic silhouette for city walks."; gender = Gender.MEN; color = "Tan"; size = 9.5; price = new BigDecimal("69.99"); stockQuantity = 8; category = lifestyle; }
                case 4 -> { name = "Urban Wave"; brand = "Nike"; description = "Responsive feel with modern design."; gender = Gender.UNISEX; color = "Grey"; size = 11.0; price = new BigDecimal("149.99"); stockQuantity = 6; category = lifestyle; }
                case 5 -> { name = "Trail Breeze"; brand = "Salomon"; description = "Grip-focused sneaker for light trails."; gender = Gender.WOMEN; color = "Green"; size = 8.5; price = new BigDecimal("139.00"); stockQuantity = 10; category = running; }
                case 6 -> { name = "Flex Trainer"; brand = "Adidas"; description = "Training-ready support for everyday wear."; gender = Gender.MEN; color = "White/Black"; size = 9.2; price = new BigDecimal("89.00"); stockQuantity = 30; category = lifestyle; }
                case 7 -> { name = "Sport Pulse"; brand = "Puma"; description = "Cushioned stride with bold branding."; gender = Gender.UNISEX; color = "Black"; size = 10.1; price = new BigDecimal("109.00"); stockQuantity = 22; category = running; }
                case 8 -> { name = "Daily Drift"; brand = "Nike"; description = "Smooth ride with a clean look."; gender = Gender.MEN; color = "Navy"; size = 10.0; price = new BigDecimal("104.50"); stockQuantity = 14; category = running; }
                case 9 -> { name = "Metro Lace"; brand = "Asics"; description = "Refined comfort for work-to-weekend."; gender = Gender.WOMEN; color = "Ivory"; size = 7.5; price = new BigDecimal("92.20"); stockQuantity = 16; category = lifestyle; }
                case 10 -> { name = "Street Classic"; brand = "Reebok"; description = "Durable daily classic with street vibe."; gender = Gender.MEN; color = "Black"; size = 9.8; price = new BigDecimal("74.90"); stockQuantity = 26; category = lifestyle; }
                case 11 -> { name = "AirLite Runner"; brand = "Nike"; description = "Breathable upper for all-day comfort."; gender = Gender.UNISEX; color = "White"; size = 8.9; price = new BigDecimal("118.00"); stockQuantity = 9; category = running; }
                default -> { additions++; continue; }
            }

            additions++;
            if (existingNames.contains(name)) continue;

            Sneaker sneaker = Sneaker.builder()
                    .name(name)
                    .brand(brand)
                    .description(description)
                    .price(price)
                    .stockQuantity(stockQuantity)
                    .gender(gender)
                    .color(color)
                    .size(size)
                    .category(category)
                    .build();

            sneaker.getImages().add(SneakerImage.builder()
                    .sneaker(sneaker)
                    .imageUrl(imageUrlFallback)
                    .build());

            sneakerRepository.save(sneaker);
            existingNames.add(name);
        }
    }

}
