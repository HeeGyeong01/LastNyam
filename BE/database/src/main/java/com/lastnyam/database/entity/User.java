package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "user_email", length = 50, nullable = false)
    private String userEmail;
    
    @Column(name = "user_password", length = 100, nullable = false)
    private String userPassword;
    
    @Column(name = "user_profile", length = 255, nullable = false)
    private String userProfile;
    
    @Column(name = "user_nickname", length = 20, nullable = false)
    private String userNickname;
    
    @Column(name = "user_social_id", length = 30, nullable = false)
    private String userSocialId;
    
    @Column(name = "user_role", length = 6, nullable = false)
    private String userRole;
}
