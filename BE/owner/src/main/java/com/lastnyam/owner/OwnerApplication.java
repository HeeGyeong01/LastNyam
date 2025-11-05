package com.lastnyam.owner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EntityScan(basePackages = "com.lastnyam.database.entity")
@SpringBootApplication(scanBasePackages = "com.lastnyam")
@EnableJpaAuditing
@EntityScan(basePackages = "com.lastnyam.database.entity")
public class OwnerApplication {

    public static void main(String[] args) {
        SpringApplication.run(OwnerApplication.class, args);
    }

}
