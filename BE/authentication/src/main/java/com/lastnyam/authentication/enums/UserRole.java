package com.lastnyam.authentication.enums;

public enum UserRole {
    USER, ANONYMOUS, OWNER, ADMIN;

    public String getName() {
        return "Role_" + this.name();
    }
}
