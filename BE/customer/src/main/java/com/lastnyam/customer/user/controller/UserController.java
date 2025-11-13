package com.lastnyam.customer.user.controller;

import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.security.dto.UserInfoResponse;
import com.lastnyam.customer.user.dto.CursorResponse;
import com.lastnyam.customer.user.dto.FavoriteShopInfo;
import com.lastnyam.customer.user.dto.TransactionQrResponse;
import com.lastnyam.customer.user.dto.UploadUrlRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingRequestDto;
import com.lastnyam.customer.user.dto.UserOnboardingResponseDto;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.customer.user.service.TransactionService;
import com.lastnyam.customer.user.service.UserService;
import com.lastnyam.database.entity.User;
import com.lastnyam.s3.dto.PresignedUrlRequest;
import com.lastnyam.s3.dto.PresignedUrlResponse;
import com.lastnyam.s3.enums.S3FileType;
import com.lastnyam.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final TransactionService transactionService;

    // 추가 정보 입력 -사용자 선호 카테고리 설정 (1~5개 선택)
    @PostMapping("/{userId}/profile/onboarding")
    public ResponseEntity<ApiResponse<UserOnboardingResponseDto>> updateOnboardingProfile(
            @PathVariable("userId") Integer userId,
            @RequestBody UserOnboardingRequestDto request) {
        UserOnboardingResponseDto result = userService.updateOnboardingProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 사용자 정보 조회
     * 특정 사용자의 정보를 반환합니다.
     *
     * @param userId 사용자 ID
     * @return 사용자 정보 (userId, email, nickname, profileImage, role 등)
     */
    @GetMapping("/{userId}/info")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getUserInfo(@PathVariable("userId") Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.ofUser());

        return ResponseEntity.ok(ApiResponse.ofSuccess(UserInfoResponse.from(user)));
    }

    /**
     * 파일 업로드용 Pre-Signed URL 생성
     *
     * @param request 파일명, 파일 타입, 파일 크기 정보
     * @return Pre-Signed URL 및 파일 정보
     */
    @PostMapping("/file/upload-url")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> generateUploadUrl(
            @RequestBody @Validated UploadUrlRequestDto request) {

        S3FileType fileType;
        try {
            fileType = S3FileType.valueOf(request.getFileType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 타입입니다: " + request.getFileType() + ". 지원 타입: QR_IMAGE");
        }

        PresignedUrlRequest s3Req = PresignedUrlRequest.builder()
                .fileName(request.getFileName())
                .fileType(fileType)
                .fileSize(request.getFileSize())
                .build();

        PresignedUrlResponse resp = s3Service.generatePresignedUploadUrl(s3Req);
        return ResponseEntity.ok(ApiResponse.ofSuccess(resp));
    }

    /**
     * 내가 찜한 가게 리스트 조회
     * 특정 사용자가 찜한 가게 목록을 반환합니다.
     *
     * @param userId 사용자 ID
     * @param lat    위도
     * @param lng    경도
     * @param cursor 커서 (페이징용, 선택사항)
     * @return 찜한 가게 목록 (커서 기반 페이징)
     */
    @GetMapping("/{userId}/favorite")
    public ResponseEntity<ApiResponse<CursorResponse<FavoriteShopInfo>>> getFavoriteShops(
            @PathVariable("userId") Integer userId,
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam(value = "cursor", required = false) String cursor) {
        CursorResponse<FavoriteShopInfo> result = userService.getFavoriteShops(userId, lat, lng, cursor);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 마감할인 거래 QR 조회
     * 사용자가 구매한 마감할인 거래의 QR 코드를 조회합니다.
     *
     * @param userId        사용자 ID
     * @param transactionId 거래 ID
     * @return QR 이미지 URL 및 거래 정보
     */
    @GetMapping("/{userId}/transaction/discount/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionQrResponse>> getDiscountTransactionQr(
            @PathVariable("userId") Integer userId,
            @PathVariable("transactionId") Integer transactionId) {
        TransactionQrResponse result = transactionService.getDiscountTransactionQr(userId, transactionId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    /**
     * 푸케팅 거래 QR 조회
     * 사용자가 당첨된 푸케팅 거래의 QR 코드를 조회합니다.
     *
     * @param userId        사용자 ID
     * @param transactionId 거래 ID
     * @return QR 이미지 URL 및 거래 정보
     */
    @GetMapping("/{userId}/transaction/foocketing/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionQrResponse>> getFoocketingTransactionQr(
            @PathVariable("userId") Integer userId,
            @PathVariable("transactionId") Integer transactionId) {
        TransactionQrResponse result = transactionService.getFoocketingTransactionQr(userId, transactionId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

}
