package com.prosneaker.sneakerstore.modules.sneakers.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "sneakers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sneaker extends BaseEntity {

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String color;

    @Builder.Default
    @Column(nullable = false)
    private int stock = 0;

    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
