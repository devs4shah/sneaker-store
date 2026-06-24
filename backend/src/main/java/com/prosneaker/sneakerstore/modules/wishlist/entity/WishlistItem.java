package com.prosneaker.sneakerstore.modules.wishlist.entity;

import com.prosneaker.sneakerstore.modules.common.entity.BaseEntity;
import com.prosneaker.sneakerstore.modules.sneakers.entity.Sneaker;
import com.prosneaker.sneakerstore.modules.users.entity.User;
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
        name = "wishlist_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "sneaker_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sneaker_id", nullable = false)
    private Sneaker sneaker;
}
