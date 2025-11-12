package com.lastnyam.customer.external.kakaopay.client;

import com.lastnyam.customer.external.kakaopay.config.KakaoPayConfig;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayApproveRequest;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayApproveResponse;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayReadyRequest;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayReadyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoPayClient {

    private final RestTemplate restTemplate;
    private final KakaoPayConfig kakaoPayConfig;

    private static final String READY_URL = "/online/v1/payment/ready";
    private static final String APPROVE_URL = "/online/v1/payment/approve";

    /**
     * 카카오페이 결제 준비
     *
     * @param request 결제 준비 요청 정보
     * @return 결제 준비 응답 (TID, Redirect URL 등)
     */
    public KakaoPayReadyResponse ready(KakaoPayReadyRequest request) {
        try {
            log.info("카카오페이 결제 준비 요청 시작 - partnerOrderId: {}, totalAmount: {}",
                    request.getPartnerOrderId(), request.getTotalAmount());

            HttpHeaders headers = createHeaders();
            HttpEntity<KakaoPayReadyRequest> entity = new HttpEntity<>(request, headers);

            String url = kakaoPayConfig.getBaseUrl() + READY_URL;
            ResponseEntity<KakaoPayReadyResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    KakaoPayReadyResponse.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("카카오페이 결제 준비 실패 - 상태코드: {}", response.getStatusCode());
                throw new RuntimeException("카카오페이 결제 준비 실패: " + response.getStatusCode());
            }

            KakaoPayReadyResponse result = response.getBody();
            if (result == null) {
                log.error("카카오페이 결제 준비 응답이 null입니다.");
                throw new RuntimeException("카카오페이 결제 준비 응답이 null입니다.");
            }

            log.info("카카오페이 결제 준비 성공 - tid: {}, createdAt: {}", result.getTid(), result.getCreatedAt());
            return result;

        } catch (RestClientException e) {
            log.error("카카오페이 결제 준비 API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("카카오페이 결제 준비 API 호출 실패", e);
        }
    }

    /**
     * 카카오페이 결제 승인
     *
     * @param request 결제 승인 요청 정보
     * @return 결제 승인 응답
     */
    public KakaoPayApproveResponse approve(KakaoPayApproveRequest request) {
        try {
            log.info("카카오페이 결제 승인 요청 시작 - tid: {}, partnerOrderId: {}",
                    request.getTid(), request.getPartnerOrderId());

            HttpHeaders headers = createHeaders();
            HttpEntity<KakaoPayApproveRequest> entity = new HttpEntity<>(request, headers);

            String url = kakaoPayConfig.getBaseUrl() + APPROVE_URL;
            ResponseEntity<KakaoPayApproveResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    KakaoPayApproveResponse.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("카카오페이 결제 승인 실패 - 상태코드: {}", response.getStatusCode());
                throw new RuntimeException("카카오페이 결제 승인 실패: " + response.getStatusCode());
            }

            KakaoPayApproveResponse result = response.getBody();
            if (result == null) {
                log.error("카카오페이 결제 승인 응답이 null입니다.");
                throw new RuntimeException("카카오페이 결제 승인 응답이 null입니다.");
            }

            log.info("카카오페이 결제 승인 성공 - tid: {}, aid: {}, approvedAt: {}",
                    result.getTid(), result.getAid(), result.getApprovedAt());
            return result;

        } catch (RestClientException e) {
            log.error("카카오페이 결제 승인 API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("카카오페이 결제 승인 API 호출 실패", e);
        }
    }

    /**
     * 카카오페이 API 요청 헤더 생성
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "SECRET_KEY " + kakaoPayConfig.getSecretKey());
        return headers;
    }
}

