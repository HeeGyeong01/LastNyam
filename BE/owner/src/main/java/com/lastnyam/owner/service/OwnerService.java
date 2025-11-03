package com.lastnyam.owner.service;

import com.lastnyam.authentication.dto.TokenDto;
import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.authentication.service.JwtService;
import com.lastnyam.common.dto.ApiResponse;
import com.lastnyam.common.enums.ApiStatus;
import com.lastnyam.database.entity.Owner;
import com.lastnyam.owner.dto.OwnerLoginRequest;
import com.lastnyam.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.dto.TokenData;
import com.lastnyam.owner.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OwnerService {
    
    private final OwnerRepository ownerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public ApiResponse<TokenData> register(OwnerRegisterRequest request) {
        // 이메일 중복 확인
        if (ownerRepository.existsByOwnerEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // Owner 엔티티 생성 및 저장
        Owner owner = Owner.builder()
                .ownerEmail(request.getEmail())
                .ownerPassword(encodedPassword)
                .build();
        
        Owner savedOwner = ownerRepository.save(owner);
        
        // JWT 토큰 생성
        String accessToken = jwtService.generateAccessToken(UserRole.OWNER, savedOwner.getOwnerId());
        String refreshToken = jwtService.generateRefreshToken(UserRole.OWNER, savedOwner.getOwnerId());
        
        TokenData tokenData = TokenData.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
        
        return new ApiResponse<>(tokenData, ApiStatus.SUCCESS, 200, "회원가입 성공");
    }
    
    public ApiResponse<TokenData> login(OwnerLoginRequest request) {
        // 이메일로 Owner 조회
        Owner owner = ownerRepository.findByOwnerEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다."));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), owner.getOwnerPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다.");
        }
        
        // JWT 토큰 생성
        String accessToken = jwtService.generateAccessToken(UserRole.OWNER, owner.getOwnerId());
        String refreshToken = jwtService.generateRefreshToken(UserRole.OWNER, owner.getOwnerId());
        
        TokenData tokenData = TokenData.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
        
        return new ApiResponse<>(tokenData, ApiStatus.SUCCESS, 200, "로그인 성공");
    }
    
    public ApiResponse<TokenData> refreshToken(String refreshToken) {
        // 토큰 유효성 검증
        if (!jwtService.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        
        // 토큰에서 정보 추출
        TokenDto tokenDto = jwtService.getClaimsFromToken(refreshToken);
        
        // 새로운 액세스 토큰 생성
        String newAccessToken = jwtService.generateAccessToken(UserRole.OWNER, tokenDto.getId());
        
        TokenData tokenData = TokenData.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
        
        return new ApiResponse<>(tokenData, ApiStatus.SUCCESS, 200, "토큰 갱신 성공");
    }
}
