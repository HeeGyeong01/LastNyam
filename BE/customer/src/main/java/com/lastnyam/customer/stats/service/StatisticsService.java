package com.lastnyam.customer.stats.service;

import com.lastnyam.customer.stats.dto.SurvivedResponse;
import com.lastnyam.customer.stats.repository.CategoryRepository;
import com.lastnyam.database.entity.FoodCategory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public SurvivedResponse getLatestFootstep() {

        List<FoodCategory> categories = categoryRepository.findAll();
        Map<String, Integer> survivedStats = new HashMap<>();
        for (FoodCategory category : categories) {
            survivedStats.put(category.getCategoryName(), category.getCategorySurvived());
        }

        return SurvivedResponse.builder()
                .survivedStats(survivedStats)
                .build();
    }
}
