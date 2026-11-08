package com.lastnyam.s3.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AWS S3 클라이언트 설정
 * 자격 증명은 SDK 기본 체인 사용: EKS에서는 Pod Identity, 로컬에서는 AWS_PROFILE
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(S3Properties.class)
public class S3Config {

    private final S3Properties s3Properties;

    /**
     * S3 클라이언트 빈 생성
     */
    @Bean
    public S3Client s3Client() {
        log.info("S3 클라이언트 생성 - Region: {}, Bucket: {}",
                s3Properties.getRegion().getStatic(),
                s3Properties.getS3().getBucket());

        return S3Client.builder()
                .region(Region.of(s3Properties.getRegion().getStatic()))
                .build();
    }

    /**
     * S3 Presigner 빈 생성 (Pre-Signed URL 생성용)
     */
    @Bean
    public S3Presigner s3Presigner() {
        log.info("S3 Presigner 생성 - Region: {}",
                s3Properties.getRegion().getStatic());

        return S3Presigner.builder()
                .region(Region.of(s3Properties.getRegion().getStatic()))
                .build();
    }
}
