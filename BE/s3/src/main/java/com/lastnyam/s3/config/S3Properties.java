package com.lastnyam.s3.config;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AWS S3 설정 프로퍼티
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "cloud.aws")
public class S3Properties {

    private S3Config s3 = new S3Config();
    private RegionConfig region = new RegionConfig();
    private CredentialsConfig credentials = new CredentialsConfig();
    private PresignedUrlConfig presignedUrl = new PresignedUrlConfig();
    private UploadConfig upload = new UploadConfig();

    @Getter
    @Setter
    public static class S3Config {
        private String bucket;
    }

    @Getter
    @Setter
    public static class RegionConfig {
        private String staticRegion;

        public String getStatic() {
            return staticRegion;
        }

        public void setStatic(String staticRegion) {
            this.staticRegion = staticRegion;
        }
    }

    @Getter
    @Setter
    public static class CredentialsConfig {
        private String accessKey;
        private String secretKey;
    }

    @Getter
    @Setter
    public static class PresignedUrlConfig {
        private int expirationMinutes = 5;
    }

    @Getter
    @Setter
    public static class UploadConfig {
        private long maxFileSize = 10485760; // 10MB
        private List<String> allowedExtensions = List.of("jpg", "jpeg", "png");
    }
}

