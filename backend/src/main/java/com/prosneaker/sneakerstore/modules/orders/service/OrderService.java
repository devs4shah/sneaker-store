package com.prosneaker.sneakerstore.modules.orders.service;

import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import com.prosneaker.sneakerstore.modules.cart.service.CartService;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.admin.dto.AdminOrderDetailResponse;
import com.prosneaker.sneakerstore.modules.admin.dto.AdminOrderListResponse;
import com.prosneaker.sneakerstore.modules.admin.mapper.AdminOrderMapper;
import com.prosneaker.sneakerstore.modules.orders.dto.CreateOrderRequest;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderListResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.OrderResponse;
import com.prosneaker.sneakerstore.modules.orders.dto.UpdateOrderStatusRequest;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderItem;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderStatus;
import com.prosneaker.sneakerstore.modules.orders.entity.PaymentStatus;
import com.prosneaker.sneakerstore.modules.coupons.dto.AppliedCouponResult;
import com.prosneaker.sneakerstore.modules.coupons.service.CouponService;
import com.prosneaker.sneakerstore.modules.inventory.service.InventoryService;
import com.prosneaker.sneakerstore.modules.notification.mapper.OrderEmailContextMapper;
import com.prosneaker.sneakerstore.modules.notification.service.EmailService;
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
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderStatusTransitionValidator statusTransitionValidator;
    private final AdminOrderMapper adminOrderMapper;
    private final EmailService emailService;
    private final InventoryService inventoryService;
    private final CouponService couponService;

    @Transactional
    public OrderResponse checkout(String email, CreateOrderRequest request) {
        Cart cart = cartService.getOrCreateCart(email);
        if (cart.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Cannot checkout with an empty cart");
        }

        inventoryService.validateCartStock(cart);

        User user = userDetailsService.getUserByEmail(email);
        Order order = Order.builder()
                .user(user)
                .orderNumber(orderNumberGenerator.generate())
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(request.getShippingAddress().trim())
                .city(request.getCity().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry().trim())
                .totalAmount(BigDecimal.ZERO)
                .totalQuantity(0)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (CartItem cartItem : cart.getItems()) {
            Sneaker sneaker = sneakerRepository.findByIdForUpdate(cartItem.getSneaker().getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));

            String imageUrl = resolvePrimaryImageUrl(sneaker);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .sneaker(sneaker)
                    .sneakerName(sneaker.getName())
                    .sneakerPrice(cartItem.getPriceAtAddition())
                    .quantity(cartItem.getQuantity())
                    .imageUrl(imageUrl)
                    .build();

            order.getItems().add(orderItem);

            BigDecimal lineTotal = cartItem.getPriceAtAddition()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
            totalQuantity += cartItem.getQuantity();
        }

        AppliedCouponResult appliedCoupons = couponService.applyCouponsToOrder(request.getCouponCodes(), totalAmount);

        order.setTotalAmount(totalAmount);
        OrderCouponApplier.applyToOrder(order, appliedCoupons);
        order.setTotalQuantity(totalQuantity);
        order = orderRepository.save(order);

        cartService.clearCart(email);

        OrderCouponApplier.initializeAppliedCoupons(order);
        emailService.sendOrderPlacedEmail(OrderEmailContextMapper.from(order));
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderListResponse> getUserOrders(String email, Pageable pageable) {
        User user = userDetailsService.getUserByEmail(email);
        Page<Order> page = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageMapper.toPageResponse(page, orderMapper::toListResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrder(String email, UUID orderId) {
        User user = userDetailsService.getUserByEmail(email);
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, user.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));
        OrderCouponApplier.initializeAppliedCoupons(order);
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderListResponse> getAllOrders(
            OrderStatus orderStatus,
            PaymentStatus paymentStatus,
            Pageable pageable) {
        Page<Order> page = orderRepository.findForAdmin(orderStatus, paymentStatus, pageable);
        return PageMapper.toPageResponse(page, adminOrderMapper::toListResponse);
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdForAdminDetails(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));
        OrderCouponApplier.initializeAppliedCoupons(order);
        return adminOrderMapper.toDetailResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));

        OrderStatus currentStatus = order.getOrderStatus();
        OrderStatus newStatus = request.getStatus();
        statusTransitionValidator.validateTransition(currentStatus, newStatus);

        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.CANCELLED) {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                inventoryService.restoreOrderStock(order);
            }
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        order.setOrderStatus(newStatus);
        Order saved = orderRepository.save(order);
        OrderCouponApplier.initializeAppliedCoupons(saved);
        if (newStatus == OrderStatus.SHIPPED) {
            emailService.sendOrderShippedEmail(OrderEmailContextMapper.from(saved));
        } else if (newStatus == OrderStatus.DELIVERED) {
            emailService.sendOrderDeliveredEmail(OrderEmailContextMapper.from(saved));
        }
        return orderMapper.toResponse(saved);
    }

    private String resolvePrimaryImageUrl(Sneaker sneaker) {
        if (sneaker.getImages() == null || sneaker.getImages().isEmpty()) {
            return null;
        }
        return sneaker.getImages().getFirst().getImageUrl();
    }
}
