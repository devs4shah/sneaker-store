package com.prosneaker.sneakerstore.modules.inventory.service;

import com.prosneaker.sneakerstore.modules.cart.entity.Cart;
import com.prosneaker.sneakerstore.modules.cart.entity.CartItem;
import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import com.prosneaker.sneakerstore.modules.common.exception.BusinessException;
import com.prosneaker.sneakerstore.modules.common.exception.ErrorCode;
import com.prosneaker.sneakerstore.modules.common.util.PageMapper;
import com.prosneaker.sneakerstore.modules.inventory.dto.InventoryItemResponse;
import com.prosneaker.sneakerstore.modules.inventory.dto.UpdateInventoryRequest;
import com.prosneaker.sneakerstore.modules.inventory.mapper.InventoryMapper;
import com.prosneaker.sneakerstore.modules.orders.entity.Order;
import com.prosneaker.sneakerstore.modules.orders.entity.OrderItem;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.sneakers.repository.SneakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final SneakerRepository sneakerRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public PageResponse<InventoryItemResponse> getInventory(Pageable pageable) {
        Page<Sneaker> page = sneakerRepository.findAllWithCategory(pageable);
        return PageMapper.toPageResponse(page, inventoryMapper::toResponse);
    }

    @Transactional
    public InventoryItemResponse updateStock(UUID sneakerId, UpdateInventoryRequest request) {
        Sneaker sneaker = sneakerRepository.findByIdWithCategory(sneakerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));

        sneaker.setStockQuantity(request.getStockQuantity());
        return inventoryMapper.toResponse(sneakerRepository.save(sneaker));
    }

    @Transactional
    public void validateCartStock(Cart cart) {
        for (CartItem cartItem : cart.getItems()) {
            Sneaker sneaker = loadSneakerForUpdate(cartItem.getSneaker().getId());
            assertSufficientStock(sneaker, cartItem.getQuantity());
        }
    }

    @Transactional
    public void validateOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Sneaker sneaker = loadSneakerForUpdate(item.getSneaker().getId());
            assertSufficientStock(sneaker, item.getQuantity());
        }
    }

    @Transactional
    public void deductOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Sneaker sneaker = loadSneakerForUpdate(item.getSneaker().getId());
            assertSufficientStock(sneaker, item.getQuantity());
            sneaker.setStockQuantity(sneaker.getStockQuantity() - item.getQuantity());
        }
    }

    @Transactional
    public void restoreOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Sneaker sneaker = loadSneakerForUpdate(item.getSneaker().getId());
            sneaker.setStockQuantity(sneaker.getStockQuantity() + item.getQuantity());
        }
    }

    private Sneaker loadSneakerForUpdate(UUID sneakerId) {
        return sneakerRepository.findByIdForUpdate(sneakerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sneaker not found"));
    }

    private void assertSufficientStock(Sneaker sneaker, int requestedQuantity) {
        if (requestedQuantity > sneaker.getStockQuantity()) {
            throw new BusinessException(
                    ErrorCode.BAD_REQUEST,
                    "Insufficient stock for " + sneaker.getName()
                            + ". Available: " + sneaker.getStockQuantity());
        }
    }
}
