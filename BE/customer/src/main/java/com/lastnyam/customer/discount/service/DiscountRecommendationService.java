package com.lastnyam.customer.discount.service;

import com.lastnyam.common.dto.CursorResponse;
import com.lastnyam.customer.cart.repository.DiscountTransactionItemRepository;
import com.lastnyam.customer.cart.repository.DiscountTransactionRepository;
import com.lastnyam.customer.discount.dto.DiscountBriefInfo;
import com.lastnyam.customer.discount.dto.DiscountRecommendationInfo;
import com.lastnyam.customer.discount.enums.DiscountSortType;
import com.lastnyam.customer.discount.repository.DiscountRepository;
import com.lastnyam.customer.discount.repository.DiscountQueryRepository;
import com.lastnyam.database.entity.DiscountTransaction;
import com.lastnyam.database.entity.DiscountTransactionItem;
import com.lastnyam.database.entity.Discount;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountRecommendationService {

    private final DiscountQueryRepository discountQueryRepository;
    private final DiscountRepository discountRepository;
    private final DiscountTransactionRepository discountTransactionRepository;
    private final DiscountTransactionItemRepository discountTransactionItemRepository;

    @Transactional
    public List<DiscountRecommendationInfo> recommend(Integer userId, Double lat, Double lng, Integer categoryId) {
        // 1) 후보 조회 (기존 쿼리 재사용)
        CursorResponse<DiscountBriefInfo> candidatesResponse =
                discountQueryRepository.findDiscountsNear(DiscountSortType.RATING, lat, lng, null, null);
        List<DiscountBriefInfo> candidates = new ArrayList<>(candidatesResponse.getContent());
        if (candidates.isEmpty()) {
            return List.of();
        }

        // discountId -> menuId 매핑 조회
        List<Integer> discountIds = candidates.stream().map(DiscountBriefInfo::getDiscountId).toList();
        Map<Integer, Integer> discountToMenuId = discountRepository.findAllById(discountIds).stream()
                .filter(d -> d.getMenu() != null)
                .collect(Collectors.toMap(Discount::getDiscountId, d -> d.getMenu().getMenuId()));

        // 2) 사용자 방문/구매 이력 로드
        List<DiscountTransaction> transactions = discountTransactionRepository.findByUserUserId(userId);

        Set<Integer> visitedShopIds = transactions.stream()
                .map(tx -> tx.getShop() != null ? tx.getShop().getShopId() : null)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        List<DiscountTransactionItem> items = transactions.isEmpty()
                ? List.of()
                : discountTransactionItemRepository.findByDiscountTransactionIn(transactions);

        Set<Integer> purchasedMenuIds = items.stream()
                .map(it -> it.getDiscount() != null && it.getDiscount().getMenu() != null
                        ? it.getDiscount().getMenu().getMenuId()
                        : null)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

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
        List<Scored> scored = new ArrayList<>(candidates.size());
        for (DiscountBriefInfo c : candidates) {
            double rating = c.getShopInfo() != null && c.getShopInfo().getRating() != null
                    ? c.getShopInfo().getRating() : 0.0;
            double ratingScore = Math.min(Math.max(rating / 5.0, 0.0), 1.0);

            double distanceKm = c.getShopInfo() != null && c.getShopInfo().getDistance() != null
                    ? c.getShopInfo().getDistance() : 0.0;
            double distanceScore = 1.0 - Math.min(distanceKm / 1.0, 1.0); // 1km 반경 기준 정규화

            double rate = c.getDiscountRate() != null ? c.getDiscountRate() : 0;
            double discountScore = Math.min(Math.max(rate / 100.0, 0.0), 1.0);

            int shopId = c.getShopInfo().getShopId();
            Integer menuId = discountToMenuId.get(c.getDiscountId());

            double shopPref = shopFreqSum > 0 ? shopFreq.getOrDefault(shopId, 0) / shopFreqSum : 0.0;
            double menuPref = menuFreqSum > 0 && menuId != null ? menuFreq.getOrDefault(menuId, 0) / menuFreqSum : 0.0;
            double pref = 0.6 * menuPref + 0.4 * shopPref;

            double score = 0.30 * pref + 0.25 * discountScore + 0.25 * ratingScore + 0.20 * distanceScore;

            boolean visited = visitedShopIds.contains(shopId);
            boolean purchased = menuId != null && purchasedMenuIds.contains(menuId);

            // 메뉴별 점수 로그
            String menuName = c.getMenuInfo() != null ? c.getMenuInfo().getName() : "(unknown)";
            log.info("[RecommendScore] userId={}, discountId={}, menu='{}', shopId={}, ratingScore={}, discountScore={}, distanceScore={}, shopPref={}, menuPref={}, pref={}, totalScore={}",
                    userId, c.getDiscountId(), menuName, shopId,
                    String.format("%.3f", ratingScore),
                    String.format("%.3f", discountScore),
                    String.format("%.3f", distanceScore),
                    String.format("%.3f", shopPref),
                    String.format("%.3f", menuPref),
                    String.format("%.3f", pref),
                    String.format("%.3f", score));

            scored.add(new Scored(c, score, visited, purchased));
        }

        // 4) 정렬 후 상위 8개 반환
        scored.sort(Comparator.comparingDouble(Scored::score).reversed());
        int limit = Math.min(8, scored.size());
        List<DiscountRecommendationInfo> result = new ArrayList<>(limit);
        for (int i = 0; i < limit; i++) {
            Scored s = scored.get(i);
            result.add(DiscountRecommendationInfo.builder()
                    .discount(s.candidate())
                    .visitedShop(s.visitedShop())
                    .purchasedMenu(s.purchasedMenu())
                    .build());
        }
        return result;
    }

    private record Scored(DiscountBriefInfo candidate, double score, boolean visitedShop, boolean purchasedMenu) {
        public double score() {
            return score;
        }
    }
}

