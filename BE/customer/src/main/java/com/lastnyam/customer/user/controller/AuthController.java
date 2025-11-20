package com.lastnyam.customer.user.controller;

import com.lastnyam.customer.user.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 관련 API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 카카오 소셜 로그인 진입점
     * GET, POST 모두 지원
     * 클라이언트가 이 엔드포인트를 호출하면 카카오 OAuth 인증 페이지로 리다이렉트됩니다.
     */
    @RequestMapping(value = "/social/kakao", method = { RequestMethod.GET, RequestMethod.POST })
    public void socialLogin(HttpServletResponse response) throws IOException {
        log.info("카카오 소셜 로그인 요청");
        response.sendRedirect("/api/oauth2/authorization/kakao");
    }

    /**
     * 로그아웃
     * 클라이언트에서 토큰을 삭제.
     * 추후 Redis 블랙리스트를 활용한 토큰 무효화 처리.
     */
    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok().build();
    }
}
