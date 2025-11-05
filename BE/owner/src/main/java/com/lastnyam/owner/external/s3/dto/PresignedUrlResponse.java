package com.lastnyam.owner.external.s3.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pre-Signed URL 생성 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {

    /**
     * 업로드용 Pre-Signed URL
     */
    private String uploadUrl;

    /**
     * S3에 저장될 파일의 키 (경로)
     */
    private String fileKey;

    /**
     * S3 버킷 이름
     */
    private String bucket;

    /**
     * URL 만료 시간
     */
    private Instant expiresAt;

    /**
     * 파일 접근용 URL (업로드 완료 후 사용)
     */
    private String fileUrl;

}
