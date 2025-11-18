package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.DailyStatistics;
import com.lastnyam.database.entity.Report;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopView;
import com.lastnyam.owner.external.gms.service.GMSService;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.report.dto.ReportResponse;
import com.lastnyam.owner.report.dto.ReportResponse.MenuDistribution;
import com.lastnyam.owner.report.dto.ReportResponse.MenuStats;
import com.lastnyam.owner.report.repository.DailyStatisticsRepository;
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
    private final DailyStatisticsRepository dailyStatisticsRepository;

    /**
     * 리포트 조회
     * daily_statistics 테이블에서 전주 일주일치 데이터를 합산하여 사용
     */
    public ReportResponse getReport(Integer userId, Integer ownerId, Integer shopId) {
        checkPermission(userId, ownerId);

        Report report = reportRepository.findByShopId(shopId);
        
        // 날짜 범위 계산 (저번주 월요일 ~ 일요일)
        LocalDate[] dateRange = calculatePreviousWeekRange();
        LocalDate startDate = dateRange[0];
        LocalDate endDate = dateRange[1];

        // 전주 일주일치 데이터 합산 (daily_statistics에서 조회)
        List<DailyStatistics> prevWeekStats = dailyStatisticsRepository
                .findByShopIdAndStatDateBetween(shopId, startDate, endDate);
        
        int totalSalesCount = prevWeekStats.stream()
                .mapToInt(DailyStatistics::getOrderCount)
                .sum();
        
        int totalRevenue = prevWeekStats.stream()
                .mapToInt(DailyStatistics::getOrderRevenue)
                .sum();
        
        int pocketingCount = prevWeekStats.stream()
                .mapToInt(DailyStatistics::getFoocketingCount)
                .sum();
        
        int visitorCount = prevWeekStats.stream()
                .mapToInt(DailyStatistics::getViewCount)
                .sum();

        // 전전주 날짜 범위 계산 (변화율 계산용)
        LocalDate[] prevPrevWeekRange = calculatePreviousPreviousWeekRange();
        LocalDate prevPrevStartDate = prevPrevWeekRange[0];
        LocalDate prevPrevEndDate = prevPrevWeekRange[1];

        // 전전주 일주일치 데이터 합산
        List<DailyStatistics> prevPrevWeekStats = dailyStatisticsRepository
                .findByShopIdAndStatDateBetween(shopId, prevPrevStartDate, prevPrevEndDate);

        Double totalSalesChangeRate = null;
        Double totalRevenueChangeRate = null;
        Double pocketingChangeRate = null;
        Double visitorChangeRate = null;

        // 전전주 데이터가 있으면 변화율 계산
        if (!prevPrevWeekStats.isEmpty()) {
            int prevPrevSalesCount = prevPrevWeekStats.stream()
                    .mapToInt(DailyStatistics::getOrderCount)
                    .sum();
            
            int prevPrevRevenue = prevPrevWeekStats.stream()
                    .mapToInt(DailyStatistics::getOrderRevenue)
                    .sum();
            
            int prevPrevPocketingCount = prevPrevWeekStats.stream()
                    .mapToInt(DailyStatistics::getFoocketingCount)
                    .sum();
            
            int prevPrevVisitorCount = prevPrevWeekStats.stream()
                    .mapToInt(DailyStatistics::getViewCount)
                    .sum();

            totalSalesChangeRate = calculateChangeRate(totalSalesCount, prevPrevSalesCount);
            totalRevenueChangeRate = calculateChangeRate(totalRevenue, prevPrevRevenue);
            pocketingChangeRate = calculateChangeRate(pocketingCount, prevPrevPocketingCount);
            visitorChangeRate = calculateChangeRate(visitorCount, prevPrevVisitorCount);
        }

        // 메뉴별 통계는 현재 주간 통계를 보여줌 (실시간 데이터)
        // 리포트 생성 시점의 전주 데이터는 리포트의 advice에만 반영됨
        List<MenuStats> statsList = menuStatRepository.getStats(shopId);
        
        // 메뉴 분포 그래프 데이터 생성 (카테고리별 판매 비중)
        // 전주 데이터 기준으로 생성하려면 별도 저장이 필요하지만, 현재는 현재 주간 통계 사용
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
     * 전전주 월요일 ~ 일요일 날짜 범위 계산 (변화율 계산용)
     */
    private LocalDate[] calculatePreviousPreviousWeekRange() {
        LocalDate[] prevWeekRange = calculatePreviousWeekRange();
        LocalDate prevPrevWeekMonday = prevWeekRange[0].minusWeeks(1);
        LocalDate prevPrevWeekSunday = prevPrevWeekMonday.plusDays(6);
        return new LocalDate[]{prevPrevWeekMonday, prevPrevWeekSunday};
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

    /**
     * 주간 리포트 생성 및 통계 초기화
     * 매주 월요일 오전 4시에 실행
     * 1. 전주 데이터를 기준으로 리포트 생성 (통계 초기화 전)
     * 2. 주간 통계 초기화
     * 
     * 주의: 리포트 데이터는 daily_statistics에서 합산하므로 별도 shift 불필요
     */
    @Transactional
    @Scheduled(cron = "0 0 4 * * MON")
    public void generateReportsAndRenewStats() {
        log.info("주간 리포트 생성 및 통계 초기화 시작");
        
        // 1단계: 전주 데이터를 기준으로 리포트 생성 (통계 초기화 전)
        generateReports();
        
        // 2단계: 메뉴 통계 초기화
        int rowCount = menuStatRepository.initializeStats();
        log.info("주간 통계 초기화 완료 : {}개", rowCount);
    }

    /**
     * 전주 데이터를 기준으로 리포트 생성
     * 통계 초기화 전에 실행되므로 현재 weekly 데이터가 전주 데이터임
     */
    @Transactional
    public void generateReports() {
        Set<Shop> activeShops = findActiveShops();
        List<Report> reports = new ArrayList<>();

        for (Shop shop : activeShops) {
            log.debug("active shop found : {}", shop.getShopName());
            // 통계 초기화 전이므로 현재 weekly 데이터가 전주 데이터임
            List<MenuStats> statsList = menuStatRepository.getStats(shop.getShopId());
            ShopView shopView = shopViewRepository.findByShopId(shop.getShopId());
            String result = GMSService.generateReport(statsList, shopView);

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
        log.info("리포트 생성 완료 : {}개", reports.size());
    }

    private Set<Shop> findActiveShops() {
        return menuStatRepository.getTargetIds();
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
