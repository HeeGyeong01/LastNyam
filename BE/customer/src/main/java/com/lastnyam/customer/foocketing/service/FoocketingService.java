package com.lastnyam.customer.foocketing.service;

import com.lastnyam.customer.exception.ResourceNotFoundException;
import com.lastnyam.customer.foocketing.dto.FoocketingDetail;
import com.lastnyam.customer.foocketing.dto.FoocketingResult;
import com.lastnyam.customer.foocketing.repository.FoocketingDetailRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRepository;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FoocketingService {

    private final RedisService redisService;

    private final FoocketingRepository foocketingRepository;
    private final FoocketingDetailRepository detailRepository;


    public FoocketingDetail getDetailOf(Double lng, Double lat, Integer foocketingId) {
        FoocketingDetail result = detailRepository.getDetailOf(lng, lat, foocketingId);

        Integer viewingCount = (Integer) redisService.get("FoocketingViewingCount:" + foocketingId);

        if (viewingCount != null) {
            result.setCurrentViewing(viewingCount);
        }
        return result;
    }


    @Transactional
    public FoocketingResult getFoocketingResult(Integer userId, Integer foocketingId) {
        Foocketing foocketing = foocketingRepository.findById(foocketingId)
                .orElseThrow(ResourceNotFoundException::ofFoocketing);

        //?? QR 이미지는 어디로 들어감?
        return null;
    }
}
