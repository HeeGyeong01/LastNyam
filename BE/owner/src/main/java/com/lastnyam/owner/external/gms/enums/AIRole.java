package com.lastnyam.owner.external.gms.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AIRole {
    DEV("developer"), USER("user");

    private final String role;
}
