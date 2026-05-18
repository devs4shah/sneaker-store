package com.prosneaker.sneakerstore.modules.users.mapper;

import com.prosneaker.sneakerstore.modules.users.dto.UserResponse;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
