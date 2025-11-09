package com.lastnyam.customer.cart.service;

import com.lastnyam.customer.cart.dto.CartAddRequestDto;
import com.lastnyam.customer.cart.dto.CartDeleteRequestDto;
import com.lastnyam.customer.cart.dto.CartItemResponseDto;
import com.lastnyam.customer.cart.dto.CartOrderRequestDto;
import com.lastnyam.customer.cart.dto.CartOrderResponseDto;
import com.lastnyam.customer.cart.dto.CartResponseDto;
import com.lastnyam.customer.cart.dto.CartUpdateRequestDto;
import com.lastnyam.customer.cart.repository.CartItemRepository;
import com.lastnyam.customer.cart.repository.CartRepository;
import com.lastnyam.customer.cart.repository.DiscountRepository;
import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.database.entity.Cart;
import com.lastnyam.database.entity.CartItem;
import com.lastnyam.database.entity.Discount;
import com.lastnyam.database.entity.User;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DiscountRepository discountRepository;

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
                .findByCartCartIdAndDiscountDiscountId(cart.getCartId(), request.getDiscountId())
                .orElseThrow(() -> BadRequestException.ofInput("장바구니에 해당 물품이 없습니다."));

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
                .findByCartCartIdAndDiscountDiscountId(cart.getCartId(), request.getDiscountId())
                .orElseThrow(() -> BadRequestException.ofInput("장바구니에 해당 물품이 없습니다."));

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

    @Transactional
    public CartOrderResponseDto orderCart(Integer userId, CartOrderRequestDto request) {
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

        // TODO: 카카오페이 결제 연동
        // 현재는 기본 구조만 제공
        log.info("카카오페이 결제 시작: userId={}, totalPrice={}", userId, totalPrice);

        // TODO: 주문 생성 및 저장 로직
        // 주문 생성 후 장바구니 비우기
        cartItemRepository.deleteAll(cartItems);
        cartRepository.delete(cart);

        return CartOrderResponseDto.builder()
                .orderId(null) // TODO: 실제 주문 ID로 변경
                .userId(userId)
                .totalPrice(totalPrice)
                .paymentStatus("PENDING") // TODO: 실제 결제 상태로 변경
                .build();
    }
}

