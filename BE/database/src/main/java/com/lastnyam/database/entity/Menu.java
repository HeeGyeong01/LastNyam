package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "menus")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    
    @Id
    @Column(name = "menu_id")
    private Integer menuId;
    
    @Column(name = "menu_name", length = 50, nullable = false)
    private String menuName;
    
    @Column(name = "menu_description", length = 255)
    private String menuDescription;
    
    @Column(name = "menu_image", length = 255)
    private String menuImage;
    
    @Column(name = "menu_price", nullable = false)
    private Integer menuPrice;
    
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;
    
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", insertable = false, updatable = false)
    private Shop shop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private FoodCategory foodCategory;
    
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Discount> discounts;
    
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Fookecting> fookectings;
}
