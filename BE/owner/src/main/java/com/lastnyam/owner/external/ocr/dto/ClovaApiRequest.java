package com.lastnyam.owner.external.ocr.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clova OCR API 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClovaApiRequest {

    private String version;
    private String requestId;
    private Long timestamp;
    private List<Image> images;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Image {
        private String format;
        private String name;
    }

    /**
     * OCR 요청 생성
     * 
     * @param requestId  요청 ID
     * @param fileName   파일명 (확장자 제외)
     * @param fileFormat 파일 형식 (png, jpg, pdf 등)
     * @return OCR 요청 객체
     */
    public static ClovaApiRequest createOcrRequest(String requestId, String fileName, String fileFormat) {
        return ClovaApiRequest.builder()
                .version("V2")
                .requestId(requestId)
                .timestamp(System.currentTimeMillis())
                .images(List.of(
                        Image.builder()
                                .format(fileFormat)
                                .name(fileName)
                                .build()))
                .build();
    }
}
