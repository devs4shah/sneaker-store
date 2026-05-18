package com.prosneaker.sneakerstore.modules.cart.entity;

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

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sneaker_id", nullable = false)
    private Sneaker sneaker;

    @Column(name = "size_value", nullable = false)
    private double sizeValue;

    @Column(nullable = false)
    private int quantity;
}
