package com.lastnyam.owner.external.ocr.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.owner.dto.BusinessLicenseOcrResponse;
import com.lastnyam.owner.external.ocr.config.ClovaApiConfig;
import com.lastnyam.owner.external.ocr.dto.ClovaApiRequest;
import com.lastnyam.owner.external.ocr.dto.ClovaApiResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

/**
 * Clova OCR API 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ClovaApiClient {

    private final RestTemplate restTemplate;
    private final ClovaApiConfig clovaApiConfig;
    private final ObjectMapper objectMapper;

    /**
     * 사업자등록증 OCR 처리
     *
     * Clova OCR API를 호출하여 사업자등록증 이미지에서 정보를 추출합니다.
     *
     * @param file 사업자등록증 이미지 파일 (jpg, png, pdf 등)
     * @return 추출된 사업자등록증 정보
     */
    public BusinessLicenseOcrResponse processBusinessLicense(MultipartFile file) {
        long startTime = System.currentTimeMillis();

        try {
            // 입력 검증
            if (file == null || file.isEmpty()) {
                log.warn("업로드된 파일이 비어있습니다.");
                throw new IllegalArgumentException("파일이 비어있습니다.");
            }

            // 파일 정보 추출
            String originalFilename = file.getOriginalFilename();
            String fileFormat = extractFileFormat(originalFilename);
            String fileName = extractFileName(originalFilename);

            log.info("Clova OCR API 호출 시작 - 파일명: {}, 형식: {}, 크기: {}bytes",
                    originalFilename,
                    fileFormat,
                    file.getSize());

            // 요청 ID 생성
            String requestId = UUID.randomUUID().toString();

            // OCR 요청 메시지 생성
            ClovaApiRequest ocrRequest = ClovaApiRequest.createOcrRequest(requestId, fileName, fileFormat);

            // 요청 헤더 설정
            HttpHeaders headers = createHeaders();

            // Multipart 요청 본문 생성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // message 파트 (JSON)
            body.add("message", objectMapper.writeValueAsString(ocrRequest));

            // file 파트 (바이너리)
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };
            body.add("file", fileResource);

            // API 호출
            ResponseEntity<ClovaApiResponse> response = null;

            try {
                log.info("Clova OCR API 요청 전송 - requestId: {}", requestId);

                response = restTemplate.postForEntity(
                        clovaApiConfig.getBaseUrl(),
                        new HttpEntity<>(body, headers),
                        ClovaApiResponse.class);
            } catch (Exception e) {
                log.error("Clova OCR API 호출 실패: {}", e.getMessage(), e);
                throw new RuntimeException("OCR API 호출 실패", e);
            }

            // 응답 처리
            if (response == null) {
                log.warn("Clova OCR API 응답이 null입니다.");
                throw new RuntimeException("OCR API 응답이 null입니다.");
            }

            log.info("Clova OCR API 응답 상태코드: {}", response.getStatusCode());

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("Clova OCR API HTTP 에러 - 상태코드: {}", response.getStatusCode());
                throw new RuntimeException("OCR API HTTP 에러: " + response.getStatusCode());
            }

            ClovaApiResponse result = response.getBody();

            if (result == null) {
                log.warn("Clova OCR API 응답 본문이 null입니다.");
                throw new RuntimeException("OCR API 응답 본문이 null입니다.");
            }

            long processingTime = System.currentTimeMillis() - startTime;

            // 응답 내용 로깅
            try {
                String responseBody = objectMapper.writeValueAsString(result);
                log.debug("Clova OCR API 응답 내용: {}", responseBody);
            } catch (Exception e) {
                log.warn("응답 내용 로깅 실패: {}", e.getMessage());
            }

            // 사업자등록증 정보 추출
            BusinessLicenseOcrResponse businessInfo = result.extractBusinessInfo();

            if (businessInfo == null) {
                log.warn("사업자등록증 정보 추출 실패");
                throw new RuntimeException("사업자등록증 정보를 추출할 수 없습니다.");
            }

            log.info(
                    "■■■■■■■■ Clova OCR 처리 성공 - 처리시간: {}ms, 상호명: {}, 사업자번호: {}, 대표자: {} ■■■■■■■■",
                    processingTime,
                    businessInfo.getCompanyName(),
                    businessInfo.getRegisterNumber(),
                    businessInfo.getRepName());

            return businessInfo;

        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Clova OCR API 호출 실패 - 처리시간: {}ms, 오류: {}", processingTime, e.getMessage(), e);
            throw new RuntimeException("OCR 처리 실패", e);
        }
    }

    /**
     * 요청 헤더 생성
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-OCR-SECRET", clovaApiConfig.getSecretKey());

        return headers;
    }

    /**
     * 파일 형식 추출 (확장자)
     */
    private String extractFileFormat(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "png";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 파일명 추출 (확장자 제외)
     */
    private String extractFileName(String filename) {
        if (filename == null || !filename.contains(".")) {
            return filename != null ? filename : "unknown";
        }
        return filename.substring(0, filename.lastIndexOf("."));
    }
}
