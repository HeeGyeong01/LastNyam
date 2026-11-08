package com.lastnyam.customer.cart.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.cart.dto.CartAddRequestDto;
import com.lastnyam.customer.cart.dto.CartDeleteRequestDto;
import com.lastnyam.customer.cart.dto.CartOrderApproveRequestDto;
import com.lastnyam.customer.cart.dto.CartOrderResponseDto;
import com.lastnyam.customer.cart.dto.CartResponseDto;
import com.lastnyam.customer.cart.dto.CartUpdateRequestDto;
import com.lastnyam.customer.cart.service.CartService;
import com.lastnyam.customer.external.kakaopay.store.KakaoPayTempStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final KakaoPayTempStore kakaoPayTempStore;

    /**
     * 장바구니 조회
     * 특정 사용자의 장바구니를 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 장바구니 정보 (cartId, userId, cartItems)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> getCart(@PathVariable("userId") Integer userId) {
        CartResponseDto result = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 장바구니 물품 추가
     * 장바구니에 물품을 추가합니다.
     * 한 번에 하나의 가게의 물품만 담을 수 있으며,
     * 이미 장바구니에 다른 가게의 물품이 있으면 에러가 발생합니다.
     *
     * @param userId 사용자 ID
     * @param request 추가할 물품 정보 (discountId, cartItemAmount)
     * @return 업데이트된 장바구니 정보
     */
    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> addItemToCart(
            @PathVariable("userId") Integer userId,
            @RequestBody CartAddRequestDto request) {
        CartResponseDto result = cartService.addItemToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 장바구니 물품 개수 수정
     * 장바구니에 있는 특정 물품의 개수를 수정합니다.
     *
     * @param userId 사용자 ID
     * @param request 수정할 물품 정보 (cartItemId, cartItemAmount)
     * @return 업데이트된 장바구니 정보
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> updateCartItemAmount(
            @PathVariable("userId") Integer userId,
            @RequestBody CartUpdateRequestDto request) {
        CartResponseDto result = cartService.updateCartItemAmount(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 장바구니 물품 제거
     * 장바구니에서 특정 물품을 제거합니다.
     *
     * @param userId 사용자 ID
     * @param request 제거할 물품 정보 (cartItemId)
     * @return 업데이트된 장바구니 정보
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartResponseDto>> removeItemFromCart(
            @PathVariable("userId") Integer userId,
            @RequestBody CartDeleteRequestDto request) {
        CartResponseDto result = cartService.removeItemFromCart(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 장바구니 결제 준비
     * 장바구니의 모든 물품에 대한 카카오페이 결제를 준비합니다.
     * 결제 준비 API를 호출하여 TID와 Redirect URL을 받습니다.
     *
     * @param userId 사용자 ID
     * @return 결제 준비 응답 (TID, Redirect URL 등)
     */
    @PostMapping("/{userId}/order")
    public ResponseEntity<ApiResponse<CartOrderResponseDto>> orderCart(
            @PathVariable("userId") Integer userId) {
        CartOrderResponseDto result = cartService.orderCart(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 장바구니 결제 승인
     * 사용자가 카카오톡에서 결제를 완료한 후, pg_token과 tid로 최종 승인을 요청합니다.
     *
     * @param userId 사용자 ID
     * @param request 결제 승인 요청 정보 (tid, pgToken, partnerOrderId)
     * @return 결제 승인 응답
     */
    // (POST 승인 엔드포인트는 카카오 콜백(GET)으로 대체되어 제거되었습니다.)

    /**
     * 카카오페이 결제 승인 콜백 (GET)
     * KakaoPay가 approval_url로 리다이렉트할 때 호출됩니다.
     * 쿼리 파라미터로 전달된 pg_token과 partner_order_id, userId를 사용해 서버에서 최종 승인 처리합니다.
     */
    @GetMapping("/kakao/approve")
    public ResponseEntity<?> approveCallback(
            @RequestParam("pg_token") String pgToken,
            @RequestParam("partner_order_id") String partnerOrderId,
            @RequestParam("userId") Integer userId) {

        String tid = kakaoPayTempStore.get(partnerOrderId);
        if (tid == null) {
            return ResponseEntity.badRequest().body(ApiResponse.ofError(400, "유효하지 않은 주문입니다. 다시 시도해 주세요."));
        }

        CartOrderApproveRequestDto approveRequest = CartOrderApproveRequestDto.builder()
                .tid(tid)
                .pgToken(pgToken)
                .partnerOrderId(partnerOrderId)
                .build();

        CartOrderResponseDto result = cartService.approveOrder(userId, approveRequest);
        kakaoPayTempStore.remove(partnerOrderId);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("https://lastnyam.shop/payment-success"))
                .build();
    }

    /**
     * 카카오페이 결제 취소 콜백 (GET)
     */
    @GetMapping("/kakao/cancel")
    public ResponseEntity<ApiResponse<String>> cancelCallback(
            @RequestParam("partner_order_id") String partnerOrderId,
            @RequestParam("userId") Integer userId) {
        kakaoPayTempStore.remove(partnerOrderId);
        return ResponseEntity.ok(ApiResponse.ofSuccess("결제가 취소되었습니다."));
    }

    /**
     * 카카오페이 결제 실패 콜백 (GET)
     */
    @GetMapping("/kakao/fail")
    public ResponseEntity<ApiResponse<String>> failCallback(
            @RequestParam(value = "partner_order_id", required = false) String partnerOrderId,
            @RequestParam(value = "userId", required = false) Integer userId) {
        if (partnerOrderId != null) {
            kakaoPayTempStore.remove(partnerOrderId);
        }
        return ResponseEntity.ok(ApiResponse.ofError(400, "결제에 실패했습니다."));
    }
}
