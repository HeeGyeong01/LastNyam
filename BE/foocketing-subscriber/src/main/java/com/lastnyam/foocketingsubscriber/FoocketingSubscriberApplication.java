package com.lastnyam.foocketingsubscriber;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication(scanBasePackages = "com.lastnyam")
@EntityScan(basePackages = "com.lastnyam.database.entity")
public class FoocketingSubscriberApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoocketingSubscriberApplication.class, args);
    }

}
