package com.prosneaker.sneakerstore.modules.sneakers.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
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
@Table(name = "sneaker_images")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SneakerImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sneaker_id", nullable = false)
    private Sneaker sneaker;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "display_order", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private int displayOrder = 0;
}
