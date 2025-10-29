package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "food_categories")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodCategory {
    
    @Id
    @Column(name = "category_id")
    private Integer categoryId;
    
    @Column(name = "category_name", length = 20, nullable = false)
    private String categoryName;
    
    @Column(name = "category_survived", nullable = false)
    private Integer categorySurvived;
}
