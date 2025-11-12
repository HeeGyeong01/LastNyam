package com.lastnyam.owner.security.service;

import com.lastnyam.database.entity.Owner;
import com.lastnyam.owner.owner.repository.OwnerRepository;
import com.lastnyam.owner.security.entity.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final OwnerRepository ownerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Owner owner = ownerRepository.findByOwnerEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Owner not found: " + username));
        return new CustomUserDetails(owner);
    }
}


