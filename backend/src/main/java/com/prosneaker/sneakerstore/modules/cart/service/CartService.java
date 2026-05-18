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
        return cartMapper.toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        Sneaker sneaker = sneakerService.findSneakerWithDetails(request.getSneakerId());

        var existing = cartItemRepository.findByCartIdAndSneakerId(cart.getId(), request.getSneakerId());
        final int newQuantity = existing
                .map(item -> item.getQuantity() + request.getQuantity())
                .orElse(request.getQuantity());

        if (sneaker.getStockQuantity() < newQuantity) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Insufficient stock");
        }

        existing.ifPresentOrElse(
                item -> item.setQuantity(newQuantity),
                () -> {
                    CartItem item = CartItem.builder()
                            .cart(cart)
                            .sneaker(sneaker)
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

        if (item.getSneaker().getStockQuantity() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Insufficient stock");
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
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private CartItem findCartItem(Cart cart, UUID itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart item not found"));
    }
}
