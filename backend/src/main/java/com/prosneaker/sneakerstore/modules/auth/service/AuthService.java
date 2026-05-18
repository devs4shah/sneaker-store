package com.prosneaker.sneakerstore.modules.auth.service;

import com.prosneaker.sneakerstore.config.security.JwtConstants;
import com.prosneaker.sneakerstore.config.security.JwtService;
import com.prosneaker.sneakerstore.modules.auth.dto.AuthResponse;
import com.prosneaker.sneakerstore.modules.auth.dto.LoginRequest;
import com.prosneaker.sneakerstore.modules.auth.dto.RefreshTokenRequest;
import com.prosneaker.sneakerstore.modules.auth.dto.RegisterRequest;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.users.entity.Role;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.mapper.UserMapper;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import com.prosneaker.sneakerstore.modules.users.service.UserService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = userService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                Role.ROLE_USER);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        User user = userDetailsService.getUserByEmail(email);
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken().trim();

        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
            }

            String email = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "Refresh token is expired or invalid");
            }

            User user = userDetailsService.getUserByEmail(email);
            return buildAuthResponse(user);
        } catch (JwtException ex) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .tokenType(JwtConstants.TOKEN_TYPE)
                .user(userMapper.toResponse(user))
                .build();
    }
}
