package com.prosneaker.sneakerstore.modules.addresses.mapper;

import com.prosneaker.sneakerstore.modules.addresses.dto.AddressRequest;
import com.prosneaker.sneakerstore.modules.addresses.dto.AddressResponse;
import com.prosneaker.sneakerstore.modules.addresses.entity.Address;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }

    public Address toEntity(AddressRequest request, User user) {
        return Address.builder()
                .user(user)
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .addressLine1(request.getAddressLine1().trim())
                .addressLine2(trimToNull(request.getAddressLine2()))
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry().trim())
                .isDefault(request.isDefault())
                .build();
    }

    public void updateEntity(Address address, AddressRequest request) {
        address.setFullName(request.getFullName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setAddressLine1(request.getAddressLine1().trim());
        address.setAddressLine2(trimToNull(request.getAddressLine2()));
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry().trim());
        address.setDefault(request.isDefault());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
