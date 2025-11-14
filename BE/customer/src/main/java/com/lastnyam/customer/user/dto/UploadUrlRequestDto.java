package com.lastnyam.customer.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Presigned URL 생성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadUrlRequestDto {

    @NotBlank(message = "파일명은 필수입니다")
    private String fileName;

    @NotBlank(message = "파일 타입은 필수입니다")
    private String fileType;

    @NotNull(message = "파일 크기는 필수입니다")
    private Long fileSize;
}
