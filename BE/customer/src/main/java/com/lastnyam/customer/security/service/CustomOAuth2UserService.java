package com.lastnyam.customer.security.service;

import com.lastnyam.authentication.enums.UserRole;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.User;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * OAuth2 사용자 정보를 로드하고 DB에 저장/업데이트하는 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // OAuth2 제공자로부터 사용자 정보 로드
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 제공자 정보 가져오기 (kakao)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // OAuth2UserInfo 생성
        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        User user = saveOrUpdate(oAuth2UserInfo);

        log.info("OAuth2 사용자 로그인 완료: userId={}, email={}", user.getUserId(), user.getUserEmail());

        // CustomOAuth2User 반환
        return new CustomOAuth2User(
                user.getUserId(),
                user.getUserRole(),
                oAuth2User.getAttributes(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getUserRole())));
    }

    /**
     * 제공자에 따라 OAuth2UserInfo 생성
     */
    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return new KakaoOAuth2UserInfo(attributes);
        }
        throw new IllegalArgumentException("지원하지 않는 OAuth2 제공자입니다: " + registrationId);
    }

    /**
     * 사용자 정보 저장 또는 업데이트
     */
    private User saveOrUpdate(OAuth2UserInfo oAuth2UserInfo) {
        String socialId = oAuth2UserInfo.getProvider() + "_" + oAuth2UserInfo.getProviderId();

        Optional<User> existingUser = userRepository.findByUserSocialId(socialId);

        if (existingUser.isPresent()) {
            // 기존 사용자 정보 업데이트
            User user = existingUser.get();
            return userRepository.save(User.builder()
                    .userId(user.getUserId())
                    .userEmail(oAuth2UserInfo.getEmail() != null ? oAuth2UserInfo.getEmail() : user.getUserEmail())
                    .userPassword("OAUTH2_USER") // OAuth2 사용자는 비밀번호 불필요
                    .userProfile(oAuth2UserInfo.getProfileImage() != null ? oAuth2UserInfo.getProfileImage()
                            : user.getUserProfile())
                    .userNickname(oAuth2UserInfo.getNickname() != null ? oAuth2UserInfo.getNickname()
                            : user.getUserNickname())
                    .userSocialId(socialId)
                    .userRole(user.getUserRole())
                    .build());
        } else {
            // 신규 사용자 생성 - ANONYMOUS 역할로 시작
            User newUser = User.builder()
                    .userEmail(oAuth2UserInfo.getEmail() != null ? oAuth2UserInfo.getEmail() : "unknown@email.com")
                    .userPassword("OAUTH2_USER")
                    .userProfile(oAuth2UserInfo.getProfileImage() != null ? oAuth2UserInfo.getProfileImage() : "")
                    .userNickname(oAuth2UserInfo.getNickname() != null ? oAuth2UserInfo.getNickname() : "사용자")
                    .userSocialId(socialId)
                    .userRole(UserRole.ANONYMOUS.name())
                    .build();

            log.info("신규 사용자 생성: socialId={}, role={}", socialId, UserRole.ANONYMOUS);
            return userRepository.save(newUser);
        }
    }
}
