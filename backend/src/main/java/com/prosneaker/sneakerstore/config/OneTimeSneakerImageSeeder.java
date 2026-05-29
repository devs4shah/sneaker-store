package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.config.storage.ImageStorageProperties;
import com.prosneaker.sneakerstore.modules.cart.repository.CartItemRepository;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Category;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Gender;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerImage;
import com.prosneaker.sneakerstore.modules.sneakers.repository.CategoryRepository;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.sneakers.storage.LocalImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * One-time dev utility:
 * - Clears orders/cart items referencing sneakers
 * - Deletes all sneakers from DB
 * - Stores 5 bundled seed images under backend/uploads/sneakers/{id}/
 * - Inserts 5 dummy sneaker rows referencing those image URLs
 *
 * It runs once and then creates a marker file next to uploads/.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class OneTimeSneakerImageSeeder implements CommandLineRunner {

    public static final String MARKER_FILE_NAME = ".dummy_sneakers_seeded_once";

    private static final List<String> IMAGE_FILE_NAMES = List.of(
            "dummy-1.png",
            "dummy-2.png",
            "dummy-3.png",
            "dummy-4.png",
            "dummy-5.png"
    );

    private final SneakerRepository sneakerRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final LocalImageStorageService localImageStorageService;
    private final ImageStorageProperties imageStorageProperties;

    @Override
    @Transactional
    public void run(String... args) {
        Path uploadDir = Path.of(imageStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload dir: " + uploadDir, e);
        }

        Path marker = uploadDir.resolve(MARKER_FILE_NAME);
        if (Files.exists(marker)) {
            log.info("OneTimeSneakerImageSeeder: marker exists, skipping.");
            return;
        }

        if (IMAGE_FILE_NAMES.size() != 5) {
            throw new IllegalStateException("Expected exactly 5 seed image filenames.");
        }

        log.info("OneTimeSneakerImageSeeder: wiping sneakers and reseeding 5 dummy entries.");

        for (Sneaker sneaker : sneakerRepository.findAll()) {
            UUID sneakerId = sneaker.getId();
            try {
                localImageStorageService.deleteSneakerDirectory(sneakerId);
            } catch (Exception ex) {
                log.warn("Failed deleting sneaker directory for {} (continuing): {}", sneakerId, ex.getMessage());
            }
        }

        log.info("Clearing orders and cart items that reference sneakers.");
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        sneakerRepository.deleteAll();

        Category running = categoryRepository.findByNameIgnoreCase("Running")
                .orElseGet(() -> categoryRepository.save(Category.builder().name("Running").build()));
        Category lifestyle = categoryRepository.findByNameIgnoreCase("Lifestyle")
                .orElseGet(() -> categoryRepository.save(Category.builder().name("Lifestyle").build()));

        for (int i = 0; i < 5; i++) {
            Category category = (i % 2 == 0) ? running : lifestyle;

            Sneaker sneaker = Sneaker.builder()
                    .name("Dummy Sneaker " + (i + 1))
                    .brand("DummyBrand")
                    .description("Dummy sneaker seeded for UI development.")
                    .price(new BigDecimal("99.99").add(new BigDecimal(i)))
                    .stockQuantity(20 + i * 5)
                    .gender(i % 4 == 0 ? Gender.UNISEX : (i % 2 == 0 ? Gender.MEN : Gender.WOMEN))
                    .color(i % 2 == 0 ? "Black" : "White")
                    .size(9.0 + i)
                    .category(category)
                    .build();

            sneaker = sneakerRepository.save(sneaker);

            Path sneakerDir = uploadDir.resolve("sneakers").resolve(sneaker.getId().toString());
            try {
                Files.createDirectories(sneakerDir);
            } catch (IOException e) {
                throw new RuntimeException("Failed to create sneaker dir: " + sneakerDir, e);
            }

            String imageFileName = IMAGE_FILE_NAMES.get(i);
            Path targetFile = sneakerDir.resolve(imageFileName);
            copySeedImage(imageFileName, targetFile);

            String publicImageUrl = imageStorageProperties.getPublicUrlPrefix()
                    + "/sneakers/" + sneaker.getId() + "/" + imageFileName;

            SneakerImage sneakerImage = SneakerImage.builder()
                    .sneaker(sneaker)
                    .imageUrl(publicImageUrl)
                    .build();

            sneaker.getImages().add(sneakerImage);
            sneakerRepository.save(sneaker);
        }

        try {
            Files.createFile(marker);
        } catch (IOException e) {
            log.warn("Failed creating marker file {} (seeder will run again): {}", marker, e.getMessage());
        }

        log.info("OneTimeSneakerImageSeeder: done.");
    }

    private void copySeedImage(String imageFileName, Path targetFile) {
        String resourcePath = "/seed-images/" + imageFileName;
        try (InputStream inputStream = getClass().getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                throw new IllegalStateException("Missing classpath seed image: " + resourcePath);
            }
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed copying seed image to: " + targetFile, e);
        }
    }
}
