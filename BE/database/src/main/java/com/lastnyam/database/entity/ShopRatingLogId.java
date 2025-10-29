package com.lastnyam.database.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopRatingLogId implements Serializable {
    
    private Integer userId;
    private Integer shopId;
}
