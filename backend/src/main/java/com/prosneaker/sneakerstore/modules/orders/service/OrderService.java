package com.prosneaker.sneakerstore.modules.orders.service;

import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import com.prosneaker.sneakerstore.modules.cart.service.CartService;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.orders.dto.CreateOrderRequest;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.UpdateOrderStatusRequest;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderItem;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.mapper.OrderMapper;
import com.prosneaker.sneakerstore.modules.orders.repository.OrderRepository;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import com.prosneaker.sneakerstore.modules.users.entity.User;
import com.prosneaker.sneakerstore.modules.users.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CartService cartService;
    private final SneakerRepository sneakerRepository;
    private final UserDetailsServiceImpl userDetailsService;

    @Transactional
    public OrderResponse checkout(String email, CreateOrderRequest request) {
        Cart cart = cartService.getOrCreateCart(email);
        if (cart.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Cart is empty");
        }

        User user = userDetailsService.getUserByEmail(email);
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress().trim())
                .city(request.getCity().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry().trim())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Sneaker sneaker = sneakerRepository.findById(cartItem.getSneaker().getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));

            if (sneaker.getStockQuantity() < cartItem.getQuantity()) {
                throw new BusinessException(
                        ErrorCode.BAD_REQUEST,
                        "Insufficient stock for " + sneaker.getName());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .sneaker(sneaker)
                    .sneakerName(sneaker.getName())
                    .brand(sneaker.getBrand())
                    .sizeValue(sneaker.getSize())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getPriceAtAddition())
                    .build();

            order.getItems().add(orderItem);

            BigDecimal lineTotal = cartItem.getPriceAtAddition()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            sneaker.setStockQuantity(sneaker.getStockQuantity() - cartItem.getQuantity());
            sneakerRepository.save(sneaker);
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        cartService.clearCart(email);

        Order savedOrder = orderRepository.findByIdWithItems(order.getId()).orElse(order);
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(String email, Pageable pageable) {
        User user = userDetailsService.getUserByEmail(email);
        Page<Order> page = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageMapper.toPageResponse(page, orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrder(String email, UUID orderId) {
        User user = userDetailsService.getUserByEmail(email);
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = status != null
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageMapper.toPageResponse(page, orderMapper::toResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));
        order.setStatus(request.getStatus());
        return orderMapper.toResponse(orderRepository.save(order));
    }
}
