package com.prosneaker.sneakerstore.modules.cart.mapper;

import com.prosneaker.sneakerstore.modules.cart.dto.CartItemResponse;
import com.prosneaker.sneakerstore.modules.cart.dto.CartResponse;
import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
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
        return CartItemResponse.builder()
                .id(item.getId())
                .sneakerId(item.getSneaker().getId())
                .sneakerName(item.getSneaker().getName())
                .brand(item.getSneaker().getBrand())
                .imageUrl(item.getSneaker().getImageUrl())
                .sizeValue(item.getSizeValue())
                .quantity(item.getQuantity())
                .unitPrice(item.getSneaker().getPrice())
                .subtotal(subtotal)
                .build();
    }
}
