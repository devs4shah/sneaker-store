package com.prosneaker.sneakerstore.modules.sneakers.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sneakers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sneaker extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private int stockQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false)
    private double size;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "sneaker", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    @Builder.Default
    private List<SneakerImage> images = new ArrayList<>();
}
