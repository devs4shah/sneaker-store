package com.prosneaker.sneakerstore.modules.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestEmailResponse {

    private final boolean success;
    private final String message;
    private final String sentTo;
}
