package com.lastnyam.owner.report.service;

import com.lastnyam.database.entity.Report;
import com.lastnyam.database.entity.Shop;
import com.lastnyam.database.entity.ShopView;
import com.lastnyam.owner.external.gms.service.GMSService;
import com.lastnyam.owner.owner.exception.OwnerErrorCode;
import com.lastnyam.owner.owner.exception.OwnerException;
import com.lastnyam.owner.report.dto.ReportResponse;
import com.lastnyam.owner.report.dto.ReportResponse.MenuStats;
import com.lastnyam.owner.report.repository.MenuStatRepository;
import com.lastnyam.owner.report.repository.ReportRepository;
import com.lastnyam.owner.report.repository.ShopViewRepository;
import java.util.ArrayList;
import java.util.List;
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

        int increasedView = shopView.getShopViewCount() - shopView.getShopViewPrevCount();
        int increasedFavorites = shopView.getShopFavoriteCount() - shopView.getShopFavoritePrevCount();

        int sum = 0;

        for (MenuStats stat : statsList) {
            sum += stat.getWeeklySold();
        }

        return ReportResponse.builder()
                .totalIncome(sum)
                .increasedViews(increasedView)
                .increasedFavorites(increasedFavorites)
                .menuStats(statsList)
                .advice(report == null ? null : report.getAdvice())
                .build();
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

            Report report = Report.builder()
                    .shop(shop)
                    .advice(result)
                    .build();

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
        int rowCount = menuStatRepository.initializeStats();
        log.info("주간 통계 초기화 완료 : {}개", rowCount);
    }

    private static void checkPermission(Integer userId, Integer ownerId) {
        if (!Objects.equals(userId, ownerId)) {
            throw new OwnerException(OwnerErrorCode.FORBIDDEN_OWNER_ACCESS);
        }
    }
}
