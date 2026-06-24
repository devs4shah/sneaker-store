package com.prosneaker.sneakerstore.modules.wishlist.service;

import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import com.prosneaker.sneakerstore.modules.wishlist.dto.WishlistItemResponse;
import com.prosneaker.sneakerstore.modules.wishlist.dto.WishlistResponse;
import com.prosneaker.sneakerstore.modules.wishlist.entity.WishlistItem;
import com.prosneaker.sneakerstore.modules.wishlist.mapper.WishlistMapper;
import com.prosneaker.sneakerstore.modules.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistMapper wishlistMapper;
    private final SneakerRepository sneakerRepository;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(String email) {
        User user = userDetailsService.getUserByEmail(email);
        List<WishlistItem> items = wishlistRepository.findAllByUserIdWithSneakerDetails(user.getId());
        return toWishlistResponse(items);
    }

    @Transactional
    public WishlistResponse addToWishlist(String email, UUID sneakerId) {
        User user = userDetailsService.getUserByEmail(email);
        Sneaker sneaker = sneakerRepository.findById(sneakerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));

        if (wishlistRepository.existsByUser_IdAndSneaker_Id(user.getId(), sneakerId)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Sneaker is already in your wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .sneaker(sneaker)
                .build();
        wishlistRepository.save(item);

        return getWishlist(email);
    }

    @Transactional
    public WishlistResponse removeFromWishlist(String email, UUID sneakerId) {
        User user = userDetailsService.getUserByEmail(email);
        WishlistItem item = wishlistRepository.findByUser_IdAndSneaker_Id(user.getId(), sneakerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker is not in your wishlist"));

        wishlistRepository.delete(item);
        return getWishlist(email);
    }

    private WishlistResponse toWishlistResponse(List<WishlistItem> items) {
        List<WishlistItemResponse> responses = items.stream()
                .map(wishlistMapper::toResponse)
                .toList();

        return WishlistResponse.builder()
                .totalItems(responses.size())
                .items(responses)
                .build();
    }
}
