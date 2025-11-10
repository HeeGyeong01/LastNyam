package com.lastnyam.foocketingsubscriber.service;

import com.lastnyam.foocketingsubscriber.repository.FoocketingRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FoocketingService {

    private final FoocketingRepository foocketingRepository;

    public int getUpcomingCount() {

        LocalDateTime from = LocalDateTime.now();
        LocalDateTime to = from.plusHours(1);

        return foocketingRepository.getFoocketingCountBetween(from, to);
    }
}
