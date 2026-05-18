package com.prosneaker.sneakerstore.modules.cart.service;

import com.prosneaker.sneakerstore.modules.cart.dto.AddCartItemRequest;
import com.prosneaker.sneakerstore.modules.cart.dto.CartResponse;
import com.prosneaker.sneakerstore.modules.cart.dto.UpdateCartItemRequest;
import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import com.prosneaker.sneakerstore.modules.cart.mapper.CartMapper;
import com.prosneaker.sneakerstore.modules.cart.repository.CartItemRepository;
import com.prosneaker.sneakerstore.modules.cart.repository.CartRepository;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.entity.SneakerSize;
import com.prosneaker.sneakerstore.modules.sneakers.service.SneakerService;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CartMapper cartMapper;
    private final SneakerService sneakerService;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        Sneaker sneaker = sneakerService.findActiveSneaker(request.getSneakerId());
        SneakerSize size = sneakerService.findSize(request.getSneakerId(), request.getSizeValue());

        if (size.getStock() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Insufficient stock for selected size");
        }

        cartItemRepository.findByCartIdAndSneakerIdAndSizeValue(
                        cart.getId(), request.getSneakerId(), request.getSizeValue())
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + request.getQuantity()),
                        () -> {
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .sneaker(sneaker)
                                    .sizeValue(request.getSizeValue())
                                    .quantity(request.getQuantity())
                                    .build();
                            cart.getItems().add(item);
                        });

        return cartMapper.toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse updateItem(String email, UUID itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findCartItem(cart, itemId);
        SneakerSize size = sneakerService.findSize(item.getSneaker().getId(), item.getSizeValue());

        if (size.getStock() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Insufficient stock for selected size");
        }

        item.setQuantity(request.getQuantity());
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, UUID itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findCartItem(cart, itemId);
        cart.getItems().remove(item);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
    }

    @Transactional
    public Cart getOrCreateCart(String email) {
        User user = userDetailsService.getUserByEmail(email);
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    private CartItem findCartItem(Cart cart, UUID itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart item not found"));
    }
}
