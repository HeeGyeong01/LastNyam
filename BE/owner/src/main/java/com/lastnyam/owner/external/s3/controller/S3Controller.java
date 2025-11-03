package com.lastnyam.owner.external.s3.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.external.s3.dto.PresignedUrlRequest;
import com.lastnyam.owner.external.s3.dto.PresignedUrlResponse;
import com.lastnyam.owner.external.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * S3 파일 업로드 컨트롤러
 * <p>
 * Pre-Signed URL 방식으로 클라이언트가 S3에 직접 업로드할 수 있도록 지원합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/owner/files")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    /**
     * Pre-Signed URL 생성
     * <p>
     * 클라이언트가 S3에 직접 업로드할 수 있는 임시 URL을 생성합니다. 응답에 포함된 fileUrl을 DB에 저장하여 사용합니다.
     *
     * @param request Pre-Signed URL 요청 정보
     * @return Pre-Signed URL 응답 (uploadUrl로 파일 업로드, fileUrl을 DB에 저장)
     */
    @PostMapping("/upload-url")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> generateUploadUrl(
            @RequestBody PresignedUrlRequest request) {

        log.info("■■■■■■■■ Pre-Signed URL 생성 요청 - 파일: {}, 타입: {} ■■■■■■■■",
                request.getFileName(),
                request.getFileType());

        try {
            // 입력 검증
            if (request.getFileName() == null || request.getFileName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.ofFail(400, "파일명이 비어있습니다."));
            }

            if (request.getFileType() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.ofFail(400, "파일 타입이 지정되지 않았습니다."));
            }

            if (request.getFileSize() == null || request.getFileSize() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.ofFail(400, "파일 크기가 유효하지 않습니다."));
            }

            // Pre-Signed URL 생성
            PresignedUrlResponse response = s3Service.generatePresignedUploadUrl(request);

            log.info("■■■■■■■■ Pre-Signed URL 생성 완료 - 키: {}, URL: {} ■■■■■■■■",
                    response.getFileKey(),
                    response.getFileUrl());

            return ResponseEntity.ok(
                    ApiResponse.ofSuccess(response));

        } catch (IllegalArgumentException e) {
            log.warn("■■■■■■■■ Pre-Signed URL 생성 실패 (잘못된 요청): {} ■■■■■■■■", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ofFail(400, e.getMessage()));

        } catch (Exception e) {
            log.error("■■■■■■■■ Pre-Signed URL 생성 실패: {} ■■■■■■■■", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.ofError(500, "URL 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
