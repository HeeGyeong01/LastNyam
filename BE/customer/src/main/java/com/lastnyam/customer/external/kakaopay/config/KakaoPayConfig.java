package com.lastnyam.customer.external.kakaopay.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class KakaoPayConfig {

    @Value("${kakao.pay.secret-key:}")
    private String secretKey;

    @Value("${kakao.pay.cid:TC0ONETIME}")
    private String cid;

    @Value("${kakao.pay.base-url:https://open-api.kakaopay.com}")
    private String baseUrl;

    @Value("${kakao.pay.approval-url:}")
    private String approvalUrl;

    @Value("${kakao.pay.cancel-url:}")
    private String cancelUrl;

    @Value("${kakao.pay.fail-url:}")
    private String failUrl;
}

