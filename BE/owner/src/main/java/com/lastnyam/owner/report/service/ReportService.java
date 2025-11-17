package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.Report;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopView;
import com.lastnyam.owner.external.gms.service.GMSService;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.report.dto.ReportResponse;
import com.lastnyam.owner.report.dto.ReportResponse.MenuDistribution;
import com.lastnyam.owner.report.dto.ReportResponse.MenuStats;
import com.lastnyam.owner.report.repository.MenuStatRepository;
import com.lastnyam.owner.report.repository.ReportRepository;
import com.lastnyam.owner.report.repository.ShopViewRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final GMSService GMSService;
    private final ReportRepository reportRepository;
    private final MenuStatRepository menuStatRepository;
    private final ShopViewRepository shopViewRepository;

    public ReportResponse getReport(Integer userId, Integer ownerId, Integer shopId) {
        checkPermission(userId, ownerId);

        Report report = reportRepository.findByShopId(shopId);
        List<MenuStats> statsList = menuStatRepository.getStats(shopId);
        ShopView shopView = shopViewRepository.findByShopId(shopId);

        // 날짜 범위 계산 (저번주 월요일 ~ 일요일)
        LocalDate[] dateRange = calculatePreviousWeekRange();
        LocalDate startDate = dateRange[0];
        LocalDate endDate = dateRange[1];

        // 총 판매 개수 계산
        int totalSalesCount = statsList.stream()
                .mapToInt(MenuStats::getWeeklySold)
                .sum();

        // 총 판매액 계산 (price * weeklySold)
        int totalRevenue = statsList.stream()
                .mapToInt(stat -> stat.getPrice() * stat.getWeeklySold())
                .sum();

        // 푸켓팅 횟수 계산
        int pocketingCount = statsList.stream()
                .mapToInt(MenuStats::getWeeklyFoocketingEntry)
                .sum();

        // 방문자수 및 변화율 계산
        int visitorCount = shopView.getShopViewCount();
        int prevVisitorCount = shopView.getShopViewPrevCount();
        Double visitorChangeRate = calculateChangeRate(visitorCount, prevVisitorCount);

        // 전주 데이터를 ShopView에서 가져와서 변화율 계산
        Integer prevTotalSalesCount = shopView.getShopTotalSalesPrevCount();
        Integer prevTotalRevenue = shopView.getShopTotalRevenuePrev();
        Integer prevPocketingCount = shopView.getShopPocketingPrevCount();

        Double totalSalesChangeRate = prevTotalSalesCount != null 
                ? calculateChangeRate(totalSalesCount, prevTotalSalesCount) 
                : null;
        Double totalRevenueChangeRate = prevTotalRevenue != null 
                ? calculateChangeRate(totalRevenue, prevTotalRevenue) 
                : null;
        Double pocketingChangeRate = prevPocketingCount != null 
                ? calculateChangeRate(pocketingCount, prevPocketingCount) 
                : null;

        // 메뉴 분포 그래프 데이터 생성 (카테고리별 판매 비중)
        List<MenuDistribution> menuDistribution = generateMenuDistribution(statsList);

        return ReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSalesCount(totalSalesCount)
                .totalSalesChangeRate(totalSalesChangeRate)
                .totalRevenue(totalRevenue)
                .totalRevenueChangeRate(totalRevenueChangeRate)
                .pocketingCount(pocketingCount)
                .pocketingChangeRate(pocketingChangeRate)
                .visitorCount(visitorCount)
                .visitorChangeRate(visitorChangeRate)
                .menuStats(statsList)
                .menuDistribution(menuDistribution)
                .advice(report == null ? null : report.getAdvice())
                .build();
    }

    /**
     * 저번주 월요일 ~ 일요일 날짜 범위 계산
     */
    private LocalDate[] calculatePreviousWeekRange() {
        LocalDate today = LocalDate.now();
        LocalDate thisWeekMonday = today.with(DayOfWeek.MONDAY);
        // 저번주 월요일 = 이번주 월요일에서 7일 전
        LocalDate prevWeekMonday = thisWeekMonday.minusWeeks(1);
        LocalDate prevWeekSunday = prevWeekMonday.plusDays(6);
        return new LocalDate[]{prevWeekMonday, prevWeekSunday};
    }

    /**
     * 변화율 계산 (전주 대비 %)
     */
    private Double calculateChangeRate(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }

    /**
     * 메뉴 분포 그래프 데이터 생성 (카테고리별 판매 비중)
     */
    private List<MenuDistribution> generateMenuDistribution(List<MenuStats> statsList) {
        // 카테고리별 판매량 집계
        Map<String, Integer> categoryCountMap = new HashMap<>();
        for (MenuStats stat : statsList) {
            String category = stat.getCategory() != null ? stat.getCategory() : "기타";
            categoryCountMap.merge(category, stat.getWeeklySold(), Integer::sum);
        }

        // MenuDistribution 리스트 생성
        List<MenuDistribution> distribution = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : categoryCountMap.entrySet()) {
            if (entry.getValue() > 0) { // 판매량이 0보다 큰 경우만 추가
                distribution.add(MenuDistribution.builder()
                        .category(entry.getKey())
                        .count(entry.getValue())
                        .build());
            }
        }

        return distribution;
    }

    @Transactional
    @Scheduled(cron = "0 0 4 * * MON")
    public void generateReports() {
        Set<Shop> activeShops = findActiveShops();
        List<Report> reports = new ArrayList<>();

        for (Shop shop : activeShops) {
            log.debug("active shop found : {}", shop.getShopName());
            List<MenuStats> statsList = menuStatRepository.getStats(shop.getShopId());
            String result = GMSService.generateReport(statsList);

            // 기존 리포트가 있으면 업데이트, 없으면 새로 생성
            Report existingReport = reportRepository.findByShopId(shop.getShopId());
            
            Report report;
            if (existingReport != null) {
                // 기존 리포트 업데이트
                report = Report.builder()
                        .shopId(shop.getShopId())
                        .shop(shop)
                        .advice(result)
                        .build();
            } else {
                // 새 리포트 생성
                report = Report.builder()
                        .shop(shop)
                        .advice(result)
                        .build();
            }

            reports.add(report);
        }

        reportRepository.saveAll(reports);
    }

    private Set<Shop> findActiveShops() {
        return menuStatRepository.getTargetIds();
    }

    @Transactional
    @Scheduled(cron = "0 0 5 * * MON")
    public void renewStats() {
        log.debug("주간 통계 초기화 시작");
        
        // ShopView의 전주 데이터 shift (통계 초기화 전에 현재 주간 데이터를 전주로 저장)
        // 통계 초기화 전이므로 현재 weekly 데이터가 전주 데이터임
        shiftShopViewStats();
        
        // 메뉴 통계 초기화
        int rowCount = menuStatRepository.initializeStats();
        log.info("주간 통계 초기화 완료 : {}개", rowCount);
    }

    /**
     * ShopView의 전주 통계 데이터를 shift
     * 현재 주간 데이터를 전주로, 전주를 전전주로 이동
     */
    @Transactional
    public void shiftShopViewStats() {
        log.debug("ShopView 통계 데이터 shift 시작");
        
        // 모든 ShopView 조회
        List<ShopView> shopViews = shopViewRepository.findAll();
        
        for (ShopView shopView : shopViews) {
            // 현재 주간 통계 계산
            List<MenuStats> statsList = menuStatRepository.getStats(shopView.getShopId());
            
            int currentTotalSalesCount = statsList.stream()
                    .mapToInt(MenuStats::getWeeklySold)
                    .sum();
            
            int currentTotalRevenue = statsList.stream()
                    .mapToInt(stat -> stat.getPrice() * stat.getWeeklySold())
                    .sum();
            
            int currentPocketingCount = statsList.stream()
                    .mapToInt(MenuStats::getWeeklyFoocketingEntry)
                    .sum();
            
            // 전주 데이터를 전전주로 shift하고, 현재 데이터를 전주로 저장
            ShopView updatedShopView = ShopView.builder()
                    .shopId(shopView.getShopId())
                    .shopViewCount(shopView.getShopViewCount())
                    .shopFavoriteCount(shopView.getShopFavoriteCount())
                    .shopViewPrevCount(shopView.getShopViewCount()) // 현재를 전주로
                    .shopFavoritePrevCount(shopView.getShopFavoriteCount()) // 현재를 전주로
                    .shopTotalSalesPrevCount(currentTotalSalesCount) // 현재 주간 데이터를 전주로
                    .shopTotalRevenuePrev(currentTotalRevenue) // 현재 주간 데이터를 전주로
                    .shopPocketingPrevCount(currentPocketingCount) // 현재 주간 데이터를 전주로
                    .build();
            
            shopViewRepository.save(updatedShopView);
        }
        
        log.info("ShopView 통계 데이터 shift 완료 : {}개", shopViews.size());
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
