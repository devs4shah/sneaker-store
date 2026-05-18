package com.prosneaker.sneakerstore.config;

import com.prosneaker.sneakerstore.modules.users.entity.Role;
import com.prosneaker.sneakerstore.modules.users.repository.UserRepository;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@prosneaker.com";
    private static final String ADMIN_PASSWORD = "Admin@12345";

    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userService.createUser(ADMIN_EMAIL, ADMIN_PASSWORD, "System", "Administrator", Role.ROLE_ADMIN);
            log.info("Default admin user created: {}", ADMIN_EMAIL);
        }
    }
}
