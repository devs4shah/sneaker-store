package com.prosneaker.sneakerstore.modules.cart.mapper;

import com.prosneaker.sneakerstore.modules.cart.dto.CartItemResponse;
import com.prosneaker.sneakerstore.modules.cart.dto.CartResponse;
import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        var itemResponses = cart.getItems().stream()
                .map(item -> {
                    BigDecimal subtotal = item.getSneaker().getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    return toItemResponse(item, subtotal);
                })
                .toList();

        for (CartItemResponse item : itemResponses) {
            totalAmount = totalAmount.add(item.getSubtotal());
            totalItems += item.getQuantity();
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item, BigDecimal subtotal) {
        Sneaker sneaker = item.getSneaker();
        String imageUrl = sneaker.getImages().isEmpty() ? null : sneaker.getImages().getFirst().getImageUrl();

        return CartItemResponse.builder()
                .id(item.getId())
                .sneakerId(sneaker.getId())
                .sneakerName(sneaker.getName())
                .brand(sneaker.getBrand())
                .imageUrl(imageUrl)
                .size(sneaker.getSize())
                .quantity(item.getQuantity())
                .unitPrice(sneaker.getPrice())
                .subtotal(subtotal)
                .build();
    }
}
