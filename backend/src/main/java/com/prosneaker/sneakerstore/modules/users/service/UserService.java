package com.prosneaker.sneakerstore.modules.users.service;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.users.dto.UpdateProfileRequest;
import com.prosneaker.sneakerstore.modules.users.dto.UserResponse;
import com.prosneaker.sneakerstore.modules.users.entity.Role;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.mapper.UserMapper;
import com.prosneaker.sneakerstore.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional
    public User createUser(String email, String password, String firstName, String lastName, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email is already registered");
        }

        User user = User.builder()
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(password))
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .role(role)
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    public UserResponse getCurrentUserProfile(String email) {
        User user = userDetailsService.getUserByEmail(email);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userDetailsService.getUserByEmail(email);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        return userMapper.toResponse(userRepository.save(user));
    }

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        return PageMapper.toPageResponse(userRepository.findAll(pageable), userMapper::toResponse);
    }
}
