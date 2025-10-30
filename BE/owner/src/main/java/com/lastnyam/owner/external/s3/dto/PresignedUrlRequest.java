package com.lastnyam.owner.external.s3.dto;

import com.lastnyam.owner.external.s3.enums.S3FileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Pre-Signed URL 생성 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlRequest {

    /**
     * 원본 파일명
     */
    private String fileName;

    /**
     * 파일 타입 (저장 경로 결정)
     */
    private S3FileType fileType;

    /**
     * 파일 크기 (bytes)
     */
    private Long fileSize;
}
