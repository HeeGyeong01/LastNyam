package com.lastnyam.s3.service;

import com.lastnyam.s3.config.S3Properties;
import com.lastnyam.s3.dto.PresignedUrlRequest;
import com.lastnyam.s3.dto.PresignedUrlResponse;
import com.lastnyam.s3.dto.S3FileInfo;
import com.lastnyam.s3.util.S3FileNameGenerator;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * S3 Pre-Signed URL 서비스
 *
 * 클라이언트가 S3에 직접 업로드할 수 있도록 임시 URL을 생성합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Properties s3Properties;

    /**
     * 업로드용 Pre-Signed URL 생성
     *
     * @param request Pre-Signed URL 요청 정보
     * @return Pre-Signed URL 응답
     */
    public PresignedUrlResponse generatePresignedUploadUrl(PresignedUrlRequest request) {
        // 파일명 검증 및 고유 파일명 생성
        validateFileName(request.getFileName());
        validateFileSize(request.getFileSize());

        String uniqueFileName = S3FileNameGenerator.generate(request.getFileName());
        String fileKey = request.getFileType().getFullPath(uniqueFileName);
        String bucket = s3Properties.getS3().getBucket();

        log.info("Pre-Signed URL 생성 시작 - 파일: {}, 타입: {}, 키: {}",
                request.getFileName(),
                request.getFileType().getDescription(),
                fileKey);

        try {
            // PutObject 요청 생성
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .build();

            // Pre-Signed URL 생성
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(
                            s3Properties.getPresignedUrl().getExpirationMinutes()))
                    .putObjectRequest(putObjectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
            URL uploadUrl = presignedRequest.url();
            Instant expiresAt = Instant.now().plus(
                    Duration.ofMinutes(s3Properties.getPresignedUrl().getExpirationMinutes()));

            // 파일 접근 URL 생성
            String fileUrl = generateFileUrl(fileKey);

            log.info("Pre-Signed URL 생성 완료 - URL 유효시간: {}분, 만료: {}",
                    s3Properties.getPresignedUrl().getExpirationMinutes(),
                    expiresAt);

            return PresignedUrlResponse.builder()
                    .uploadUrl(uploadUrl.toString())
                    .fileKey(fileKey)
                    .bucket(bucket)
                    .expiresAt(expiresAt)
                    .fileUrl(fileUrl)
                    .build();

        } catch (Exception e) {
            log.error("Pre-Signed URL 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Pre-Signed URL 생성 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 파일 URL 생성 (다운로드/접근용)
     *
     * @param fileKey S3 파일 키
     * @return 파일 URL
     */
    public String generateFileUrl(String fileKey) {
        String bucket = s3Properties.getS3().getBucket();

        GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build();

        URL url = s3Client.utilities().getUrl(getUrlRequest);
        return url.toString();
    }

    /**
     * S3 파일 정보 조회
     *
     * @param fileKey S3 파일 키
     * @return 파일 정보
     */
    public S3FileInfo getFileInfo(String fileKey) {
        String bucket = s3Properties.getS3().getBucket();

        log.info("S3 파일 정보 조회 - 키: {}", fileKey);

        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .build();

            HeadObjectResponse response = s3Client.headObject(headObjectRequest);

            return S3FileInfo.builder()
                    .fileKey(fileKey)
                    .fileSize(response.contentLength())
                    .contentType(response.contentType())
                    .fileUrl(generateFileUrl(fileKey))
                    .uploadedAt(response.lastModified())
                    .bucket(bucket)
                    .build();

        } catch (Exception e) {
            log.error("S3 파일 정보 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("파일 정보 조회 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 파일명 검증
     */
    private void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 비어있습니다.");
        }

        String extension = S3FileNameGenerator.getFileExtension(fileName);
        if (!s3Properties.getUpload().getAllowedExtensions().contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 형식입니다. 허용된 형식: " +
                            s3Properties.getUpload().getAllowedExtensions());
        }
    }

    /**
     * 파일 크기 검증
     */
    private void validateFileSize(Long fileSize) {
        if (fileSize == null || fileSize <= 0) {
            throw new IllegalArgumentException("파일 크기가 유효하지 않습니다.");
        }

        if (fileSize > s3Properties.getUpload().getMaxFileSize()) {
            throw new IllegalArgumentException(
                    String.format("파일 크기가 제한을 초과했습니다. 최대 크기: %d bytes",
                            s3Properties.getUpload().getMaxFileSize()));
        }
    }
}

