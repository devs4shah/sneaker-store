package com.prosneaker.sneakerstore.modules.orders.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sneaker_id", nullable = false)
    private Sneaker sneaker;

    @Column(nullable = false)
    private String sneakerName;

    @Column(nullable = false)
    private String brand;

    @Column(name = "size_value", nullable = false)
    private double sizeValue;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;
}
