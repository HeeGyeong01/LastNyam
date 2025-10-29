package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_favorites")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavorite {
    
    @Id
    @Column(name = "user_favorite_id")
    private Integer userFavoriteId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private FoodCategory foodCategory;
}
