package com.lastnyam.customer.foocketing.service;

import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.CustomerErrorCode;
import com.lastnyam.customer.foocketing.dto.FoocketingDetail;
import com.lastnyam.customer.foocketing.dto.FoocketingResult;
import com.lastnyam.customer.foocketing.repository.FoocketingDetailRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRankRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FoocketingService {

    private final RedisService redisService;

    private final FoocketingRepository foocketingRepository;
    private final FoocketingRankRepository foocketingRankRepository;
    private final UserRepository userRepository;
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

        Foocketing foocketing = foocketingRepository.findById(foocketingId).orElse(null);

        if (foocketing == null || !userRepository.existsById(userId)) {
            throw new BadRequestException(CustomerErrorCode.INVALID_QUERY);
        }

        Integer rank = foocketingRankRepository.getRankOf(userId, foocketingId);

        FoocketingResult result = new FoocketingResult();
        result.setSuccess(false);
        result.setRank(rank);
        if (rank <= foocketing.getFoocketingAmount()) {
            Shop shop = foocketing.getMenu().getShop();
            result.setShopId(shop.getShopId());
            result.setSuccess(true);
        }
        return result;
    }
}
