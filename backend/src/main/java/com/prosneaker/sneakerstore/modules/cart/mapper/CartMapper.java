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
        int totalItems = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        var itemResponses = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        for (CartItemResponse item : itemResponses) {
            totalItems += item.getQuantity();
            subtotal = subtotal.add(item.getLineSubtotal());
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Sneaker sneaker = item.getSneaker();
        BigDecimal lineSubtotal = item.getPriceAtAddition()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        String imageUrl = sneaker.getImages().isEmpty() ? null : sneaker.getImages().getFirst().getImageUrl();

        return CartItemResponse.builder()
                .id(item.getId())
                .sneakerId(sneaker.getId())
                .sneakerName(sneaker.getName())
                .brand(sneaker.getBrand())
                .imageUrl(imageUrl)
                .size(sneaker.getSize())
                .quantity(item.getQuantity())
                .priceAtAddition(item.getPriceAtAddition())
                .currentUnitPrice(sneaker.getPrice())
                .lineSubtotal(lineSubtotal)
                .build();
    }
}
