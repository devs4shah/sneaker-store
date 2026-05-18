package com.prosneaker.sneakerstore.modules.users.dto;

import com.prosneaker.sneakerstore.modules.users.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserResponse {

    private final UUID id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final Role role;
    private final Instant createdAt;
}
