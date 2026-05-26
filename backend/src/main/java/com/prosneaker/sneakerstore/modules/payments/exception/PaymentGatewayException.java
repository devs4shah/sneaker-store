package com.prosneaker.sneakerstore.modules.payments.exception;

import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import lombok.Getter;

@Getter
public class PaymentGatewayException extends RuntimeException {

    private final ErrorCode errorCode;

    public PaymentGatewayException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public PaymentGatewayException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
