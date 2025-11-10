package com.lastnyam.customer.cart.service;

import com.lastnyam.customer.cart.dto.CartAddRequestDto;
import com.lastnyam.customer.cart.dto.CartDeleteRequestDto;
import com.lastnyam.customer.cart.dto.CartItemResponseDto;
import com.lastnyam.customer.cart.dto.CartOrderApproveRequestDto;
import com.lastnyam.customer.cart.dto.CartOrderResponseDto;
import com.lastnyam.customer.cart.dto.CartResponseDto;
import com.lastnyam.customer.cart.dto.CartUpdateRequestDto;
import com.lastnyam.customer.cart.repository.CartItemRepository;
import com.lastnyam.customer.cart.repository.CartRepository;
import com.lastnyam.customer.cart.repository.DiscountRepository;
import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.external.kakaopay.client.KakaoPayClient;
import com.lastnyam.customer.external.kakaopay.config.KakaoPayConfig;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayApproveRequest;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayApproveResponse;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayReadyRequest;
import com.lastnyam.customer.external.kakaopay.dto.KakaoPayReadyResponse;
import com.lastnyam.customer.external.kakaopay.store.KakaoPayTempStore;
import com.lastnyam.database.entity.Cart;
import com.lastnyam.database.entity.CartItem;
import com.lastnyam.database.entity.Discount;
import com.lastnyam.database.entity.User;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DiscountRepository discountRepository;
    private final KakaoPayClient kakaoPayClient;
    private final KakaoPayConfig kakaoPayConfig;
    private final KakaoPayTempStore kakaoPayTempStore;

    @Transactional(readOnly = true)
    public CartResponseDto getCart(Integer userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(ResourceNotFoundException::ofCart);

        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        
        List<CartItemResponseDto> cartItemDtos = cartItems.stream()
                .map(cartItem -> {
                    Discount discount = cartItem.getDiscount();
                    return CartItemResponseDto.builder()
                            .cartItemId(cartItem.getCartItemId())
                            .discountId(discount.getDiscountId())
                            .cartItemAmount(cartItem.getCartItemAmount())
                            .menuName(discount.getMenu().getMenuName())
                            .discountPrice(discount.getDiscountPrice())
                            .discountRate(discount.getDiscountRate())
                            .shopId(discount.getMenu().getShop().getShopId())
                            .shopName(discount.getMenu().getShop().getShopName())
                            .build();
                })
                .collect(Collectors.toList());

        return CartResponseDto.builder()
                .cartId(cart.getCartId())
                .userId(userId)
                .cartItems(cartItemDtos)
                .build();
    }

    @Transactional
    public CartResponseDto addItemToCart(Integer userId, CartAddRequestDto request) {
        Discount discount = discountRepository.findById(request.getDiscountId())
                .orElseThrow(ResourceNotFoundException::ofDiscount);

        // 장바구니 조회 또는 생성
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(User.builder().userId(userId).build())
                            .build();
                    return cartRepository.save(newCart);
                });

        // 기존 장바구니에 아이템이 있는지 확인
        List<CartItem> existingItems = cartItemRepository.findByCartCartId(cart.getCartId());
        
        if (!existingItems.isEmpty()) {
            // 기존 아이템의 가게 ID 확인
            Integer existingShopId = existingItems.get(0).getDiscount().getMenu().getShop().getShopId();
            Integer newShopId = discount.getMenu().getShop().getShopId();
            
            // 다른 가게의 물품을 담으려고 하면 에러
            if (!existingShopId.equals(newShopId)) {
                throw BadRequestException.ofInput("이미 장바구니에 다른 가게의 물품이 있습니다. 한 번에 하나의 가게의 물품만 담을 수 있습니다.");
            }
        }

        // 이미 같은 discountId가 장바구니에 있는지 확인
        CartItem existingCartItem = cartItemRepository
                .findByCartCartIdAndDiscountDiscountId(cart.getCartId(), request.getDiscountId())
                .orElse(null);

        if (existingCartItem != null) {
            // 이미 있으면 개수만 증가
            CartItem updatedItem = CartItem.builder()
                    .cartItemId(existingCartItem.getCartItemId())
                    .cart(cart)
                    .discount(discount)
                    .cartItemAmount(existingCartItem.getCartItemAmount() + request.getCartItemAmount())
                    .build();
            cartItemRepository.save(updatedItem);
        } else {
            // 없으면 새로 추가
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .discount(discount)
                    .cartItemAmount(request.getCartItemAmount())
                    .build();
            cartItemRepository.save(newCartItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponseDto updateCartItemAmount(Integer userId, CartUpdateRequestDto request) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(ResourceNotFoundException::ofCart);

        CartItem cartItem = cartItemRepository
                .findByCartCartIdAndCartItemId(cart.getCartId(), request.getCartItemId())
                .orElseThrow(() -> BadRequestException.ofInput("장바구니에 해당 아이템이 없습니다."));

        if (request.getCartItemAmount() <= 0) {
            throw BadRequestException.ofInput("물품 개수는 1개 이상이어야 합니다.");
        }

        CartItem updatedItem = CartItem.builder()
                .cartItemId(cartItem.getCartItemId())
                .cart(cart)
                .discount(cartItem.getDiscount())
                .cartItemAmount(request.getCartItemAmount())
                .build();
        cartItemRepository.save(updatedItem);

        return getCart(userId);
    }

    @Transactional
    public CartResponseDto removeItemFromCart(Integer userId, CartDeleteRequestDto request) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(ResourceNotFoundException::ofCart);

        CartItem cartItem = cartItemRepository
                .findByCartCartIdAndCartItemId(cart.getCartId(), request.getCartItemId())
                .orElseThrow(() -> BadRequestException.ofInput("장바구니에 해당 아이템이 없습니다."));

        cartItemRepository.delete(cartItem);

        // 장바구니에 아이템이 없으면 장바구니도 삭제
        List<CartItem> remainingItems = cartItemRepository.findByCartCartId(cart.getCartId());
        if (remainingItems.isEmpty()) {
            cartRepository.delete(cart);
        }

        // 삭제 후 장바구니가 비어있으면 빈 응답 반환
        Cart remainingCart = cartRepository.findByUserUserId(userId).orElse(null);
        if (remainingCart == null) {
            return CartResponseDto.builder()
                    .cartId(null)
                    .userId(userId)
                    .cartItems(List.of())
                    .build();
        }

        return getCart(userId);
    }

    /**
     * 장바구니 결제 준비
     * 카카오페이 결제 준비 API를 호출하여 결제 정보를 전달하고 TID와 Redirect URL을 받습니다.
     *
     * @param userId 사용자 ID
     * @return 결제 준비 응답 (TID, Redirect URL 등)
     */
    @Transactional
    public CartOrderResponseDto orderCart(Integer userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(ResourceNotFoundException::ofCart);

        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        
        if (cartItems.isEmpty()) {
            throw BadRequestException.ofInput("장바구니가 비어있습니다.");
        }

        // 총 가격 계산
        int totalPrice = cartItems.stream()
                .mapToInt(item -> item.getDiscount().getDiscountPrice() * item.getCartItemAmount())
                .sum();

        // 상품명 생성 (여러 상품이면 "외 N개" 형식)
        String itemName = cartItems.stream()
                .map(item -> item.getDiscount().getMenu().getMenuName())
                .limit(1)
                .findFirst()
                .orElse("상품");
        
        if (cartItems.size() > 1) {
            itemName += " 외 " + (cartItems.size() - 1) + "개";
        }

        // 총 수량 계산
        int totalQuantity = cartItems.stream()
                .mapToInt(CartItem::getCartItemAmount)
                .sum();

        // 가맹점 주문번호 생성 (UUID 기반)
        String partnerOrderId = "ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        
        // 부가세 계산 (총액의 10%)
        int vatAmount = (int) Math.round(totalPrice / 11.0);
        int taxFreeAmount = totalPrice - vatAmount;

        // 콜백에 전달할 쿼리 파라미터 부착 (userId, partner_order_id)
        String approvalUrlWithParams = UriComponentsBuilder.fromHttpUrl(kakaoPayConfig.getApprovalUrl())
                .queryParam("userId", userId)
                .queryParam("partner_order_id", partnerOrderId)
                .build().toUriString();
        String cancelUrlWithParams = UriComponentsBuilder.fromHttpUrl(kakaoPayConfig.getCancelUrl())
                .queryParam("userId", userId)
                .queryParam("partner_order_id", partnerOrderId)
                .build().toUriString();
        String failUrlWithParams = UriComponentsBuilder.fromHttpUrl(kakaoPayConfig.getFailUrl())
                .queryParam("userId", userId)
                .queryParam("partner_order_id", partnerOrderId)
                .build().toUriString();

        // 카카오페이 결제 준비 요청 생성
        KakaoPayReadyRequest readyRequest = KakaoPayReadyRequest.builder()
                .cid(kakaoPayConfig.getCid())
                .partnerOrderId(partnerOrderId)
                .partnerUserId(String.valueOf(userId))
                .itemName(itemName)
                .quantity(totalQuantity)
                .totalAmount(totalPrice)
                .taxFreeAmount(taxFreeAmount)
                .vatAmount(vatAmount)
                .approvalUrl(approvalUrlWithParams)
                .cancelUrl(cancelUrlWithParams)
                .failUrl(failUrlWithParams)
                .build();

        // 카카오페이 결제 준비 API 호출
        KakaoPayReadyResponse readyResponse = kakaoPayClient.ready(readyRequest);

        log.info("카카오페이 결제 준비 완료 - userId: {}, tid: {}, partnerOrderId: {}", 
                userId, readyResponse.getTid(), partnerOrderId);

        // Ready 응답으로 받은 tid를 partnerOrderId와 매핑하여 임시 저장
        kakaoPayTempStore.put(partnerOrderId, readyResponse.getTid());

        return CartOrderResponseDto.builder()
                .orderId(null) // 결제 승인 후 주문 생성
                .userId(userId)
                .totalPrice(totalPrice)
                .paymentStatus("READY") // 결제 준비 완료
                .tid(readyResponse.getTid())
                .partnerOrderId(partnerOrderId) // 결제 승인 시 필요
                .nextRedirectAppUrl(readyResponse.getNextRedirectAppUrl())
                .nextRedirectMobileUrl(readyResponse.getNextRedirectMobileUrl())
                .nextRedirectPcUrl(readyResponse.getNextRedirectPcUrl())
                .build();
    }

    /**
     * 장바구니 결제 승인
     * 사용자가 카카오톡에서 결제를 완료한 후, pg_token과 tid로 최종 승인을 요청합니다.
     *
     * @param userId 사용자 ID
     * @param request 결제 승인 요청 정보 (tid, pgToken, partnerOrderId)
     * @return 결제 승인 응답
     */
    @Transactional
    public CartOrderResponseDto approveOrder(Integer userId, CartOrderApproveRequestDto request) {
        // 카카오페이 결제 승인 요청 생성
        KakaoPayApproveRequest approveRequest = KakaoPayApproveRequest.builder()
                .cid(kakaoPayConfig.getCid())
                .tid(request.getTid())
                .partnerOrderId(request.getPartnerOrderId())
                .partnerUserId(String.valueOf(userId))
                .pgToken(request.getPgToken())
                .build();

        // 카카오페이 결제 승인 API 호출
        KakaoPayApproveResponse approveResponse = kakaoPayClient.approve(approveRequest);

        log.info("카카오페이 결제 승인 완료 - userId: {}, tid: {}, aid: {}, approvedAt: {}", 
                userId, approveResponse.getTid(), approveResponse.getAid(), approveResponse.getApprovedAt());

        // 장바구니 조회
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(ResourceNotFoundException::ofCart);

        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());

        // 총 가격 계산
        int totalPrice = cartItems.stream()
                .mapToInt(item -> item.getDiscount().getDiscountPrice() * item.getCartItemAmount())
                .sum();

        // TODO: 주문 생성 및 저장 로직 (DiscountTransaction 등)
        // 주문 생성 후 장바구니 비우기
        cartItemRepository.deleteAll(cartItems);
        cartRepository.delete(cart);

        return CartOrderResponseDto.builder()
                .orderId(null) // TODO: 실제 주문 ID로 변경
                .userId(userId)
                .totalPrice(totalPrice)
                .paymentStatus("APPROVED") // 결제 승인 완료
                .tid(approveResponse.getTid())
                .aid(approveResponse.getAid())
                .approvedAt(approveResponse.getApprovedAt())
                .build();
    }
}

