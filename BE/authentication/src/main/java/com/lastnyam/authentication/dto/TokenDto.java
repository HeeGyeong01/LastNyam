package com.lastnyam.authentication.dto;

import com.lastnyam.authentication.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenDto {
    private Integer id;
    private UserRole role;
}
