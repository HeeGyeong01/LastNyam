package com.lastnyam.owner.file.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.file.dto.UploadUrlRequestDto;
import com.lastnyam.s3.dto.PresignedUrlRequest;
import com.lastnyam.s3.dto.PresignedUrlResponse;
import com.lastnyam.s3.enums.S3FileType;
import com.lastnyam.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/owner/file")
@RequiredArgsConstructor
public class FileUploadController {

    private final S3Service s3Service;

    @PostMapping("/upload-url")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> generateUploadUrl(
            @RequestBody @Validated UploadUrlRequestDto request) {

        S3FileType fileType;
        try {
            fileType = S3FileType.valueOf(request.getFileType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 타입입니다: " + request.getFileType() + ". 지원 타입: MENU_IMAGE, SHOP_PROFILE_IMAGE");
        }

        PresignedUrlRequest s3Req = PresignedUrlRequest.builder()
                .fileName(request.getFileName())
                .fileType(fileType)
                .fileSize(request.getFileSize())
                .build();

        PresignedUrlResponse resp = s3Service.generatePresignedUploadUrl(s3Req);
        return ResponseEntity.ok(ApiResponse.ofSuccess(resp));
    }
}
