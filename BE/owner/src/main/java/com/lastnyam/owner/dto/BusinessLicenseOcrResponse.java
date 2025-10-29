package com.lastnyam.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사업자등록증 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLicenseOcrResponse {
    private String taxType; // 과세 유형
    private String registerNumber; // 사업자등록번호
    private String companyName; // 상호명
    private String repName; // 대표자명
    private String birth; // 생년월일
    private String openDate; // 개업일자
    private String bisAddress; // 사업장 소재지
}
