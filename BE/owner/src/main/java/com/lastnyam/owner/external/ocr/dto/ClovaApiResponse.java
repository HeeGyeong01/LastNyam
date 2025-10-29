package com.lastnyam.owner.external.ocr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lastnyam.owner.dto.BusinessLicenseOcrResponse;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clova OCR API 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClovaApiResponse {

    private String version;
    private String requestId;
    private Long timestamp;
    private List<ImageResult> images;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ImageResult {
        private String uid;
        private String name;
        private String inferResult;
        private String message;
        private BizLicense bizLicense;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BizLicense {
        private Result result;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private List<Field> taxType; // 과세 유형
        private List<Field> registerNumber; // 사업자등록번호
        private List<Field> companyName; // 상호명
        private List<Field> repName; // 대표자명
        private List<Field> birth; // 생년월일
        private List<Field> openDate; // 개업일자
        private List<Field> bisAddress; // 사업장 소재지
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Field {
        private String text;
        private String keyText;
        private Double confidenceScore;
    }

    /**
     * 첫 번째 텍스트 값 추출 헬퍼 메서드
     */
    private static String extractFirstText(List<Field> fields) {
        if (fields != null && !fields.isEmpty() && fields.get(0) != null) {
            return fields.get(0).getText();
        }
        return null;
    }

    /**
     * OCR 결과에서 필요한 정보 추출
     */
    public BusinessLicenseOcrResponse extractBusinessInfo() {
        if (images == null || images.isEmpty()) {
            return null;
        }

        ImageResult imageResult = images.get(0);
        if (imageResult.getBizLicense() == null || imageResult.getBizLicense().getResult() == null) {
            return null;
        }

        Result result = imageResult.getBizLicense().getResult();

        return BusinessLicenseOcrResponse.builder()
                .taxType(extractFirstText(result.getTaxType()))
                .registerNumber(extractFirstText(result.getRegisterNumber()))
                .companyName(extractFirstText(result.getCompanyName()))
                .repName(extractFirstText(result.getRepName()))
                .birth(extractFirstText(result.getBirth()))
                .openDate(extractFirstText(result.getOpenDate()))
                .bisAddress(extractFirstText(result.getBisAddress()))
                .build();
    }
}
