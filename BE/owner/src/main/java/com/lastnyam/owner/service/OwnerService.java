package com.lastnyam.owner.service;

import com.lastnyam.database.entity.Owner;
import com.lastnyam.owner.dto.OwnerRegisterRequest;
import com.lastnyam.owner.exception.RegisterException;
import com.lastnyam.owner.repository.OwnerRepository;
import jakarta.servlet.http.HttpServletResponse;
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

    public void register(OwnerRegisterRequest request) {
        // 이메일 중복 확인
        if (ownerRepository.existsByOwnerEmail(request.getEmail())) {
            throw new RegisterException("이미 존재하는 이메일입니다.", HttpServletResponse.SC_BAD_REQUEST);
        }
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Owner 엔티티 생성 및 저장
        Owner owner = Owner.builder()
                .ownerEmail(request.getEmail())
                .ownerPassword(encodedPassword)
                .build();

        ownerRepository.save(owner);
    }
}
