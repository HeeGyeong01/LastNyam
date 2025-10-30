package com.lastnyam.owner.external.gms.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    public String generateReport(List<MenuStats> stats) {
        GMSRequest request = GMSRequest.builder()
                .model(AIModel.GPT41_NANO.getModelName())
                .build();

        GMSMessage message = generateMessage(stats);
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

    private GMSMessage generateMessage(List<MenuStats> stats) {
        StringBuilder builder = new StringBuilder();

        for (MenuStats stat : stats) {
            builder.append(stat.toString()).append("\n");
        }

        return GMSMessage.builder()
                .content(builder.toString())
                .role(AIRole.USER.getRole())
                .build();
    }

}
