package com.lastnyam.owner.external.gms.dto;

import com.lastnyam.owner.external.gms.enums.AIRole;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GMSRequest {

    private static final String DEV_MESSAGE = """
            You are a fresh-food retail inventory management expert.
            Analyze the weekly statistics from surplus stock that was listed and sold as discounted items, and provide inventory management advice.
            ‘Fooketting’(푸켓팅) is a portmanteau of Food + Ticketing: a limited quantity of items is listed as free allocations, and customers receive them on a first-come, first-served basis by submitting a participation request.
            
            ### Data Given
            - Name of Menu
            
            ### Data to analyze
            - Discounted units sold per menu item
            - Fooketting participation conversion rate per menu item
            - Total sales amount
            - Week-over-week increase in views
            - Week-over-week increase in wishlist (likes)
            
            ### Response format
            Write advice in Korean, structured in 3 paragraphs:
            1. Current sales trend analysis (positive/negative indicators)
            2. Menu-level inventory adjustment suggestions (based on concrete numbers)
            3. Actionable items for next week
            
            ### Critical constraints
            - Since this is surplus inventory, do not recommend increasing stock.
            - Provide specific, data-driven recommendations only.
            - Keep each paragraph concise with 2–3 sentences.
            - Use simple, easy-to-understand wording.
            - Answer in Korean.
            """;

    public String model;

    @Builder.Default
    public List<GMSMessage> messages = new ArrayList<>(Collections.singletonList(
            GMSMessage.builder()
                    .role(AIRole.DEV.getRole())
                    .content(DEV_MESSAGE)
                    .build()
    ));

    public void addMessage(GMSMessage message) {
        messages.add(message);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GMSMessage {

        @Builder.Default
        public String role = AIRole.USER.getRole();
        public String content;
    }
}
