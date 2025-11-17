package com.lastnyam.customer.foocketing.service;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.cart.repository.DiscountTransactionItemRepository;
import com.lastnyam.customer.cart.repository.DiscountTransactionRepository;
import com.lastnyam.customer.foocketing.dto.FoocketingBriefInfo;
import com.lastnyam.customer.foocketing.dto.FoocketingRecommendationInfo;
import com.lastnyam.customer.foocketing.enums.FoocketingSortType;
import com.lastnyam.customer.foocketing.repository.FoocketingQueryRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingRepository;
import com.lastnyam.customer.foocketing.repository.FoocketingTransactionRepository;
import com.lastnyam.customer.global.dto.ShopInfo;
import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.DiscountTransactionItem;
import com.lastnyam.database.entity.Foocketing;
import com.lastnyam.database.entity.FoocketingTransaction;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoocketingRecommendationService {

    private final FoocketingQueryRepository foocketingQueryRepository;
    private final FoocketingTransactionRepository foocketingTransactionRepository;
    private final FoocketingRepository foocketingRepository;
    private final DiscountTransactionRepository discountTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;

    @Transactional(readOnly = true)
    public List<FoocketingRecommendationInfo> recommend(Integer userId, Double lat, Double lng, Integer categoryId) {
        log.info("[FoocketingRecommend] start userId={}, lat={}, lng={}, categoryId={}", userId, lat, lng, categoryId);
        // 1) 후보 조회
        CursorResponse<FoocketingBriefInfo> candidatesResponse =
                foocketingQueryRepository.findFoocketingsNear(FoocketingSortType.CLOSEST, lat, lng, categoryId, null);
        List<FoocketingBriefInfo> candidates = new ArrayList<>(candidatesResponse.getContent());
        if (candidates.isEmpty()) {
            log.warn("[FoocketingRecommend] no candidates found near lat={}, lng={}, categoryId={}", lat, lng,
                    categoryId);
            return List.of();
        }
        log.info("[FoocketingRecommend] candidates.size={}", candidates.size());

        // foocketingId -> menuId 매핑 조회
        List<Integer> foocketingIds = candidates.stream().map(FoocketingBriefInfo::getFoocketingId).toList();
        Map<Integer, Integer> foocketingToMenuId = foocketingRepository.findAllById(foocketingIds).stream()
                .filter(f -> f.getMenu() != null)
                .collect(Collectors.toMap(Foocketing::getFoocketingId, f -> f.getMenu().getMenuId()));
        log.info("[FoocketingRecommend] foocketingIds={}, mappedMenuIds={}", foocketingIds.size(),
                foocketingToMenuId.size());

        // 2) 사용자 방문/구매 이력 로드
        // 2-1) 푸켓팅 참여 이력 → 방문 상점
        List<FoocketingTransaction> ftTransactions = foocketingTransactionRepository.findByUserUserId(userId);
        Set<Integer> visitedShopIds = ftTransactions.stream()
                .map(tx -> tx.getShop() != null ? tx.getShop().getShopId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));

        // 2-2) 마감 세일(디스카운트) 구매 이력 → 방문 상점 + 구매한 메뉴ID
        List<DiscountTransaction> dtTransactions = discountTransactionRepository.findByUserUserId(userId);
        List<DiscountTransactionItem> dtItems = dtTransactions.isEmpty()
                ? List.of()
                : discountTransactionItemRepository.findByDiscountTransactionIn(dtTransactions);

        // 방문 상점: 할인 거래의 shop
        for (DiscountTransaction dt : dtTransactions) {
            if (dt.getShop() != null && dt.getShop().getShopId() != null) {
                visitedShopIds.add(dt.getShop().getShopId());
            }
        }
        // 구매한 메뉴ID: 할인 아이템의 discount.menu.menuId
        Set<Integer> purchasedMenuIds = dtItems.stream()
                .map(it -> it.getDiscount() != null && it.getDiscount().getMenu() != null
                        ? it.getDiscount().getMenu().getMenuId()
                        : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        log.info("[FoocketingRecommend] ftTransactions={}, dtTransactions={}, visitedShops={}, purchasedMenus={}",
                ftTransactions.size(), dtTransactions.size(), visitedShopIds.size(), purchasedMenuIds.size());

        // 빈도 기반 선호 맵(간단 정규화)
        Map<Integer, Integer> shopFreq = new HashMap<>();
        for (Integer sid : visitedShopIds) {
            shopFreq.put(sid, shopFreq.getOrDefault(sid, 0) + 1);
        }
        Map<Integer, Integer> menuFreq = new HashMap<>();
        for (Integer mid : purchasedMenuIds) {
            menuFreq.put(mid, menuFreq.getOrDefault(mid, 0) + 1);
        }
        double shopFreqSum = shopFreq.values().stream().mapToInt(Integer::intValue).sum();
        double menuFreqSum = menuFreq.values().stream().mapToInt(Integer::intValue).sum();

        // 3) 스코어 계산
        record Scored(FoocketingBriefInfo candidate, double score, boolean visitedShop, boolean purchasedMenu) {
        }
        List<Scored> scored = new ArrayList<>(candidates.size());
        for (FoocketingBriefInfo c : candidates) {
            ShopInfo s = c.getShop();
            double rating = s != null && s.getRating() != null ? s.getRating() : 0.0;
            if (Double.isNaN(rating) || Double.isInfinite(rating)) {
                rating = 0.0;
            }
            double ratingScore = Math.min(Math.max(rating / 5.0, 0.0), 1.0);

            double distanceKm = s != null && s.getDistance() != null ? s.getDistance() : 0.0;
            double distanceScore = 1.0 - Math.min(distanceKm, 1.0); // 1km 반경 기준 정규화

            Integer shopId = s != null ? s.getShopId() : null;
            Integer menuId = foocketingToMenuId.get(c.getFoocketingId());

            double shopPref = shopFreqSum > 0 && shopId != null ? shopFreq.getOrDefault(shopId, 0) / shopFreqSum : 0.0;
            double menuPref = menuFreqSum > 0 && menuId != null ? menuFreq.getOrDefault(menuId, 0) / menuFreqSum : 0.0;
            double pref = 0.6 * menuPref + 0.4 * shopPref;

            // 할인 점수 항목은 없으므로 0으로 두고 동일한 틀 유지
            double score = 0.30 * pref + 0.35 * ratingScore + 0.35 * distanceScore;

            boolean visited = shopId != null && visitedShopIds.contains(shopId);
            boolean purchased = menuId != null && purchasedMenuIds.contains(menuId);

            scored.add(new Scored(c, score, visited, purchased));

            log.info(
                    "[FoocketingScore] userId={}, foocketingId={}, shopId={}, menuId={}, ratingScore={}, distanceScore={}, shopPref={}, menuPref={}, pref={}, totalScore={}",
                    userId, c.getFoocketingId(), shopId, menuId,
                    String.format("%.3f", ratingScore),
                    String.format("%.3f", distanceScore),
                    String.format("%.3f", shopPref),
                    String.format("%.3f", menuPref),
                    String.format("%.3f", pref),
                    String.format("%.3f", score));
        }

        // 4) 정렬 후 상위 8개 반환
        scored.sort(Comparator.comparingDouble(Scored::score).reversed());
        int limit = Math.min(8, scored.size());
        List<FoocketingRecommendationInfo> result = new ArrayList<>(limit);
        for (int i = 0; i < limit; i++) {
            Scored s = scored.get(i);
            result.add(FoocketingRecommendationInfo.builder()
                    .foocketing(s.candidate())
                    .visitedShop(s.visitedShop())
                    .purchasedMenu(s.purchasedMenu())
                    .build());
        }
        List<Integer> topIds = result.stream().map(r -> r.getFoocketing().getFoocketingId()).toList();
        log.info("[FoocketingRecommend] resultCount={}, topFoocketingIds={}", result.size(), topIds);
        return result;
    }
}


