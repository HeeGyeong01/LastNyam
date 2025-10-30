package com.lastnyam.database.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ShopRatingLogId implements Serializable {

    private Integer user;
    private Integer shop;
}
