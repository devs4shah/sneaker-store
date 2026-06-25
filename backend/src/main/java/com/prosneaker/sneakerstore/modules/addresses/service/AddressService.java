package com.prosneaker.sneakerstore.modules.addresses.service;

import com.prosneaker.sneakerstore.modules.addresses.dto.AddressRequest;
import com.prosneaker.sneakerstore.modules.addresses.dto.AddressResponse;
import com.prosneaker.sneakerstore.modules.addresses.entity.Address;
import com.prosneaker.sneakerstore.modules.addresses.mapper.AddressMapper;
import com.prosneaker.sneakerstore.modules.addresses.repository.AddressRepository;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(String email) {
        User user = userDetailsService.getUserByEmail(email);
        return addressRepository.findByUser_IdOrderByIsDefaultDescCreatedAtDesc(user.getId()).stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        User user = userDetailsService.getUserByEmail(email);
        boolean shouldBeDefault = request.isDefault() || addressRepository.countByUser_Id(user.getId()) == 0;

        if (shouldBeDefault) {
            addressRepository.clearDefaultForUser(user.getId());
            request.setDefault(true);
        }

        Address address = addressMapper.toEntity(request, user);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(String email, UUID addressId, AddressRequest request) {
        Address address = getOwnedAddress(email, addressId);

        if (request.isDefault()) {
            addressRepository.clearDefaultForUser(address.getUser().getId());
        } else if (address.isDefault()) {
            request.setDefault(true);
        }

        addressMapper.updateEntity(address, request);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, UUID addressId) {
        Address address = getOwnedAddress(email, addressId);
        UUID userId = address.getUser().getId();
        boolean wasDefault = address.isDefault();

        addressRepository.delete(address);

        if (wasDefault) {
            addressRepository.findFirstByUser_IdOrderByCreatedAtAsc(userId)
                    .ifPresent(nextDefault -> {
                        nextDefault.setDefault(true);
                        addressRepository.save(nextDefault);
                    });
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(String email, UUID addressId) {
        Address address = getOwnedAddress(email, addressId);
        addressRepository.clearDefaultForUser(address.getUser().getId());
        address.setDefault(true);
        return addressMapper.toResponse(addressRepository.save(address));
    }

    private Address getOwnedAddress(String email, UUID addressId) {
        User user = userDetailsService.getUserByEmail(email);
        return addressRepository.findByIdAndUser_Id(addressId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Address not found"));
    }
}
