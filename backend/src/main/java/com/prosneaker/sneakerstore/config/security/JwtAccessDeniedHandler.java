package com.prosneaker.sneakerstore.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(ErrorCode.FORBIDDEN.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getOutputStream(),
                ApiResponse.error(ErrorCode.FORBIDDEN.getDefaultMessage()));
    }
}
