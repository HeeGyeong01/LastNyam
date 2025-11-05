package com.lastnyam.owner.external.ocr.service;

import com.lastnyam.owner.external.ocr.dto.BusinessLicenseOcrResponse;
import com.lastnyam.owner.external.ocr.client.ClovaApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * OCR 서비스 사업자등록증 이미지를 처리하여 정보를 추출합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OcrService {

    private final ClovaApiClient clovaApiClient;

    /**
     * 사업자등록증 OCR 처리
     *
     * @param file 사업자등록증 이미지 파일
     * @return 추출된 사업자등록증 정보
     */
    public BusinessLicenseOcrResponse processBusinessLicense(MultipartFile file) {
        log.info("사업자등록증 OCR 처리 요청 - 파일명: {}, 크기: {}bytes",
                file.getOriginalFilename(),
                file.getSize());

        try {
            BusinessLicenseOcrResponse result = clovaApiClient.processBusinessLicense(file);

            log.info("사업자등록증 OCR 처리 완료 - 상호명: {}, 사업자번호: {}",
                    result.getCompanyName(),
                    result.getRegisterNumber());

            return result;
        } catch (Exception e) {
            log.error("사업자등록증 OCR 처리 실패: {}", e.getMessage(), e);
            throw new RuntimeException("사업자등록증 처리 중 오류가 발생했습니다.", e);
        }
    }
}
