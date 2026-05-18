package com.prosneaker.sneakerstore.modules.sneakers.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "sneaker_sizes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sneaker_id", "size_value"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SneakerSize extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sneaker_id", nullable = false)
    private Sneaker sneaker;

    @Column(name = "size_value", nullable = false)
    private double sizeValue;

    @Builder.Default
    @Column(nullable = false)
    private int stock = 0;
}
