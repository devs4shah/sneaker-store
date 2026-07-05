package com.prosneaker.sneakerstore.modules.common.exception;

import com.prosneaker.sneakerstore.modules.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handlesBusinessExceptionWithStatus() {
        BusinessException ex = new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found");

        ResponseEntity<ApiResponse<Map<String, String>>> response = handler.handleBusinessException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Sneaker not found", response.getBody().getMessage());
    }

    @Test
    void handlesMalformedJson() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleUnreadableMessage(new HttpMessageNotReadableException("bad json"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Malformed JSON request body", response.getBody().getMessage());
    }
}
