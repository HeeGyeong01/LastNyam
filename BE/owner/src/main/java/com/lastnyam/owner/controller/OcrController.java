package com.lastnyam.owner.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.owner.dto.BusinessLicenseOcrResponse;
import com.lastnyam.owner.service.OcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * OCR API 컨트롤러
 *
 * 사업자등록증 이미지 OCR 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OcrController {

    private final OcrService ocrService;

    /**
     * 사업자등록증 OCR 처리
     *
     * @param file 사업자등록증 이미지 파일 (jpg, png, pdf 등)
     * @return OCR 처리 결과
     */
    @PostMapping(value = "/business-license", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BusinessLicenseOcrResponse>> processBusinessLicense(
            @RequestParam("file") MultipartFile file) {

        log.info("■■■■■■■■ 사업자등록증 OCR API 호출 - 파일명: {} ■■■■■■■■",
                file.getOriginalFilename());

        try {
            // 입력 검증
            if (file.isEmpty()) {
                log.warn("업로드된 파일이 비어있습니다.");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.ofFail(400, "파일이 비어있습니다."));
            }

            // OCR 처리
            BusinessLicenseOcrResponse businessInfo = ocrService.processBusinessLicense(file);

            // 성공 응답
            ApiResponse<BusinessLicenseOcrResponse> response = ApiResponse.ofSuccess(
                    businessInfo,
                    "사업자등록증 OCR 처리가 완료되었습니다.");

            log.info("■■■■■■■■ 사업자등록증 OCR API 완료 - 상호명: {} ■■■■■■■■",
                    businessInfo.getCompanyName());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("■■■■■■■■ 사업자등록증 OCR API 실패 (잘못된 요청): {} ■■■■■■■■", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ofFail(400, e.getMessage()));

        } catch (Exception e) {
            log.error("■■■■■■■■ 사업자등록증 OCR API 실패: {} ■■■■■■■■", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.ofError(500, "OCR 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
