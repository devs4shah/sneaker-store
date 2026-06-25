package com.prosneaker.sneakerstore.modules.addresses.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AddressResponse {

    private final UUID id;
    private final String fullName;
    private final String phoneNumber;
    private final String addressLine1;
    private final String addressLine2;
    private final String city;
    private final String state;
    private final String postalCode;
    private final String country;
    private final boolean isDefault;
    private final Instant createdAt;
}
