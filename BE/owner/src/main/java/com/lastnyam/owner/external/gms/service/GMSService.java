package com.lastnyam.owner.external.gms.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lastnyam.database.entity.ShopView;
import com.lastnyam.owner.external.gms.configuration.GmsConfiguration;
import com.lastnyam.owner.external.gms.dto.GMSRequest;
import com.lastnyam.owner.external.gms.dto.GMSRequest.GMSMessage;
import com.lastnyam.owner.external.gms.dto.GMSResponse;
import com.lastnyam.owner.external.gms.enums.AIModel;
import com.lastnyam.owner.external.gms.enums.AIRole;
import com.lastnyam.owner.report.dto.ReportResponse.MenuStats;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class GMSService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final GmsConfiguration gmsConfig;

    /**
     * 데이터 전달해주기
     */
    public String generateReport(List<MenuStats> stats, ShopView shopView) {
        GMSRequest request = GMSRequest.builder()
                .model(AIModel.GPT41_NANO.getModelName())
                .build();

        GMSMessage message = generateMessage(stats, shopView);
        request.addMessage(message);

        try {
            GMSResponse response = restClient.post()
                    .uri(gmsConfig.getGmsUrl())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + gmsConfig.getApiKey())
                    .body(objectMapper.writeValueAsString(request))
                    .retrieve()
                    .body(GMSResponse.class);

            String report = null;
            if (response != null) {
                report = response.getChoices().getFirst().getMessage().getContent();
            }
            return report;
        } catch (JsonProcessingException e) {
            log.error(e.getMessage());
        }

        return "";
    }

    /**
     * AI 프롬프트에 전달할 메시지 생성
     * 프롬프트 요구사항에 맞춰 다음 데이터 포함:
     * 1. Discounted units sold per menu item (메뉴별 할인 판매 개수)
     * 2. Foocketing participation conversion rate per menu item (메뉴별 푸켓팅 참여 전환율)
     * 3. Total sales amount (총 판매액)
     * 4. Week-over-week increase in views (주간 조회수 증가)
     * 5. Week-over-week increase in wishlist (주간 즐겨찾기 증가)
     */
    private GMSMessage generateMessage(List<MenuStats> stats, ShopView shopView) {
        StringBuilder builder = new StringBuilder();
        
        // === 매장 전체 통계 ===
        builder.append("=== 매장 전체 통계 ===\n");
        
        // 총 판매액 (Total sales amount) - MenuStats에서 계산
        // 주의: 리포트 생성 시점에는 통계 초기화 전이므로 현재 weekly 데이터가 전주 데이터임
        int totalRevenue = stats.stream()
                .mapToInt(stat -> (stat.getPrice() != null ? stat.getPrice() : 0) * 
                                 (stat.getWeeklySold() != null ? stat.getWeeklySold() : 0))
                .sum();
        builder.append("총 판매액: ").append(totalRevenue).append("원\n");
        
        // 주간 조회수 증가율 (Week-over-week increase in views)
        if (shopView != null) {
            int currentViews = shopView.getShopViewCount();
            int prevViews = shopView.getShopViewPrevCount();
            double viewIncreaseRate = calculateChangeRate(currentViews, prevViews);
            builder.append("주간 조회수 증가율: ").append(String.format("%.2f", viewIncreaseRate)).append("%\n");
        } else {
            builder.append("주간 조회수 증가율: 데이터 없음\n");
        }
        
        // 주간 즐겨찾기 증가율 (Week-over-week increase in wishlist)
        if (shopView != null) {
            int currentFavorites = shopView.getShopFavoriteCount();
            int prevFavorites = shopView.getShopFavoritePrevCount();
            double favoriteIncreaseRate = calculateChangeRate(currentFavorites, prevFavorites);
            builder.append("주간 즐겨찾기 증가율: ").append(String.format("%.2f", favoriteIncreaseRate)).append("%\n");
        } else {
            builder.append("주간 즐겨찾기 증가율: 데이터 없음\n");
        }
        
        builder.append("\n");
        
        // === 메뉴별 통계 ===
        builder.append("=== 메뉴별 통계 ===\n");
        for (MenuStats stat : stats) {
            // Discounted units sold per menu item
            int weeklySold = stat.getWeeklySold() != null ? stat.getWeeklySold() : 0;
            
            // Foocketing participation conversion rate per menu item
            double conversionRate = 0.0;
            if (stat.getWeeklyFoocketingView() != null && stat.getWeeklyFoocketingView() > 0) {
                int entry = stat.getWeeklyFoocketingEntry() != null ? stat.getWeeklyFoocketingEntry() : 0;
                conversionRate = (double) entry / stat.getWeeklyFoocketingView() * 100;
            }
            
            builder.append(String.format(
                "- 메뉴명: %s, 카테고리: %s, 가격: %d원, " +
                "주간 판매: %d개, " +
                "푸켓팅 조회: %d회, 푸켓팅 참여: %d회, 전환율: %.2f%%\n",
                stat.getName() != null ? stat.getName() : "알 수 없음",
                stat.getCategory() != null ? stat.getCategory() : "기타",
                stat.getPrice() != null ? stat.getPrice() : 0,
                weeklySold,
                stat.getWeeklyFoocketingView() != null ? stat.getWeeklyFoocketingView() : 0,
                stat.getWeeklyFoocketingEntry() != null ? stat.getWeeklyFoocketingEntry() : 0,
                conversionRate
            ));
        }

        return GMSMessage.builder()
                .content(builder.toString())
                .role(AIRole.USER.getRole())
                .build();
    }
    
    /**
     * 변화율 계산 (전주 대비 %)
     */
    private double calculateChangeRate(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }

}
