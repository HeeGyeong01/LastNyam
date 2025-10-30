package com.lastnyam.database.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "owner")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Owner {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id")
    private Integer ownerId;
    
    @Column(name = "owner_email", length = 50, nullable = false)
    private String ownerEmail;
    
    @Column(name = "owner_password", length = 255, nullable = false)
    private String ownerPassword;
}
