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

    @Transactional
    public CartResponse getCart(String email) {
        return cartMapper.toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        validateQuantity(request.getQuantity());

        Cart cart = getOrCreateCart(email);
        Sneaker sneaker = sneakerService.findSneakerWithDetails(request.getSneakerId());

        if (sneaker.getStockQuantity() <= 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Sneaker is out of stock");
        }

        var existing = cartItemRepository.findByCartIdAndSneakerId(cart.getId(), request.getSneakerId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            validateStock(sneaker, newQuantity);
            item.setQuantity(newQuantity);
        } else {
            validateStock(sneaker, request.getQuantity());
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .sneaker(sneaker)
                    .quantity(request.getQuantity())
                    .priceAtAddition(sneaker.getPrice())
                    .build();
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
        return cartMapper.toResponse(getCartForUser(email));
    }

    @Transactional
    public CartResponse updateItem(String email, UUID itemId, UpdateCartItemRequest request) {
        validateQuantity(request.getQuantity());

        Cart cart = getCartForUser(email);
        CartItem item = findCartItem(cart, itemId);
        Sneaker sneaker = item.getSneaker();

        validateStock(sneaker, request.getQuantity());
        item.setQuantity(request.getQuantity());

        cartRepository.save(cart);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, UUID itemId) {
        Cart cart = getCartForUser(email);
        CartItem item = findCartItem(cart, itemId);
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getCartForUser(email);
        cart.getItems().clear();
        cartRepository.save(cart);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public Cart getOrCreateCart(String email) {
        User user = userDetailsService.getUserByEmail(email);
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    @Transactional(readOnly = true)
    public Cart getCartForUser(String email) {
        User user = userDetailsService.getUserByEmail(email);
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart not found"));
    }

    private CartItem findCartItem(Cart cart, UUID itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart item not found"));
    }

    private void validateQuantity(int quantity) {
        if (quantity < 1) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Quantity must be at least 1");
        }
    }

    private void validateStock(Sneaker sneaker, int requestedQuantity) {
        if (requestedQuantity > sneaker.getStockQuantity()) {
            throw new BusinessException(
                    ErrorCode.BAD_REQUEST,
                    "Insufficient stock. Available: " + sneaker.getStockQuantity());
        }
    }
}
