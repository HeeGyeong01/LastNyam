package com.lastnyam.customer.foocketing.service;

import com.lastnyam.customer.exception.BadRequestException;
import com.lastnyam.customer.exception.CustomerErrorCode;
import com.lastnyam.customer.foocketing.dto.FoocketingDetail;
import com.lastnyam.customer.foocketing.dto.FoocketingFailInfo;
import com.lastnyam.customer.foocketing.dto.FoocketingFailResult;
import com.lastnyam.customer.foocketing.dto.FoocketingResult;
import com.lastnyam.customer.foocketing.dto.FoocketingSuccessResult;
import com.lastnyam.customer.foocketing.enums.FoocketingResultStatus;
import com.lastnyam.customer.foocketing.repository.FoocketingDetailRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingFailRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRankRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRepository;
import com.lastnyam.customer.global.dto.ShopInfoWithMenu;
import com.lastnyam.customer.shop.repository.ShopQueryRepository;
import com.lastnyam.customer.user.repository.UserRepository;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.Menu;
import com.lastnyam.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FoocketingService {

    private static final String VIEW_PREFIX = "FoocketingViewingCount:";
    private static final long VIEW_WINDOW_MILLIS = 30_000L;
    private final RedisService redisService;
    private final FoocketingRepository foocketingRepository;
    private final FoocketingRankRepository foocketingRankRepository;
    private final ShopQueryRepository shopRepository;
    private final FoocketingFailRepository foocketingFailRepository;
    private final UserRepository userRepository;
    private final FoocketingDetailRepository detailRepository;

    public FoocketingDetail getDetailOf(Double lng, Double lat, Integer userId, Integer foocketingId) {
        if (userId == null) {
            userId = 0;
        }
        FoocketingDetail result = detailRepository.getDetailOf(lng, lat, userId, foocketingId);
        Long count = updateAndGetCurrentViewing(foocketingId, userId);

        result.setCurrentViewing(Math.toIntExact(count));

        return result;
    }

    private Long updateAndGetCurrentViewing(Integer foocketingId, Integer userId) {
        String key = VIEW_PREFIX + foocketingId;

        if (userId != null && userId > 0) {
            long now = System.currentTimeMillis();
            redisService.addZSet(key, userId, now);
        }
        return getCurrentViewerCount(key);
    }

    private Long getCurrentViewerCount(String key) {
        long now = System.currentTimeMillis();
        long maxExpiredScore = now - VIEW_WINDOW_MILLIS;

        redisService.removeRangeByScore(key, 0, maxExpiredScore);

        Long count = redisService.getCountFromZCard(key);

        return count != null ? count : 0;
    }


    @Transactional
    public FoocketingResult getFoocketingResult(Integer userId, Integer foocketingId, Double lat, Double lng) {
        Foocketing foocketing = foocketingRepository.findById(foocketingId)
                .orElseThrow(() -> new BadRequestException(CustomerErrorCode.INVALID_QUERY));

        validateUser(userId);

        Integer rank = foocketingRankRepository.getRankOf(userId, foocketingId);

        if (rank == -1) {
            return buildWaitingResult(rank);
        }

        if (rank <= foocketing.getFoocketingAmount()) {
            return buildSuccessResult(foocketing, rank, lat, lng);
        }

        return buildFailResult(foocketing, rank, lat, lng);
    }

    private void validateUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new BadRequestException(CustomerErrorCode.INVALID_QUERY);
        }
    }

    private FoocketingResult buildWaitingResult(Integer rank) {
        return FoocketingResult.builder()
                .status(FoocketingResultStatus.WAITING)
                .rank(rank)
                .build();
    }

    private FoocketingSuccessResult buildSuccessResult(Foocketing foocketing,
                                                       Integer rank,
                                                       Double lat,
                                                       Double lng) {
        Menu menu = foocketing.getMenu();
        Integer shopId = menu.getShop().getShopId();

        ShopInfoWithMenu shopInfoWithMenu = shopRepository.getShopInfoWithMenuOf(shopId, lat, lng);

        return FoocketingSuccessResult.of(rank, shopInfoWithMenu);
    }

    private FoocketingFailResult buildFailResult(Foocketing foocketing,
                                                 Integer rank,
                                                 Double lat,
                                                 Double lng) {
        Menu menu = foocketing.getMenu();
        Integer shopId = menu.getShop().getShopId();
        Integer categoryId = menu.getFoodCategory().getCategoryId();

        FoocketingFailInfo fail = foocketingFailRepository
                .getFailResult(foocketing.getFoocketingId(), shopId, categoryId, lat, lng);

        return FoocketingFailResult.of(rank, fail);
    }
}
