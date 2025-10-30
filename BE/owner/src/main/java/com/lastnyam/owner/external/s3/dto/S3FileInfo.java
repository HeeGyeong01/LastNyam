package com.lastnyam.owner.external.s3.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * S3 파일 정보 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class S3FileInfo {

    /**
     * S3 파일 키 (전체 경로)
     */
    private String fileKey;

    /**
     * 원본 파일명
     */
    private String originalFileName;

    /**
     * 파일 크기 (bytes)
     */
    private Long fileSize;

    /**
     * 컨텐츠 타입
     */
    private String contentType;

    /**
     * 파일 URL
     */
    private String fileUrl;

    /**
     * 업로드 시간
     */
    private Instant uploadedAt;

    /**
     * 버킷 이름
     */
    private String bucket;
}
