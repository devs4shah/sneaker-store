package com.prosneaker.sneakerstore.config;

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
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@prosneaker.com";
    private static final String ADMIN_PASSWORD = "Admin@12345";

    private final UserRepository userRepository;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    private final SneakerRepository sneakerRepository;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userService.createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "System", "Administrator", Role.ROLE_ADMIN);
            log.info("Default admin user created: {}", ADMIN_EMAIL);
        }

        if (categoryRepository.count() == 0) {
            seedCatalog();
        }
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
                .imageUrl("https://images.example.com/nike-air-max-pulse.jpg")
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
                        .imageUrl("https://images.example.com/reebok-classic-1.jpg")
                        .build(),
                SneakerImage.builder()
                        .sneaker(sneaker2)
                        .imageUrl("https://images.example.com/reebok-classic-2.jpg")
                        .build()));

        sneakerRepository.save(sneaker2);
        log.info("Sample categories and sneakers seeded");
    }
}
