package com.lastnyam.owner.external.gms.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GMSResponse {

    private String id;
    private String object;
    private Long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    @JsonProperty("service_tier")
    private String serviceTier;

    @Data
    public static class Choice {
        private Integer index;
        private Message message;
        private Object logprobs;

        @JsonProperty("finish_reason")
        private String finishReason;
    }

    @Data
    public static class Message {
        private String role;
        private String content;
        private String refusal;
        private List<Object> annotations;
    }

    @Data
    public static class Usage {
        @JsonProperty("prompt_tokens")
        private Integer promptTokens;

        @JsonProperty("completion_tokens")
        private Integer completionTokens;

        @JsonProperty("total_tokens")
        private Integer totalTokens;

        @JsonProperty("prompt_tokens_details")
        private PromptTokensDetails promptTokensDetails;

        @JsonProperty("completion_tokens_details")
        private CompletionTokensDetails completionTokensDetails;
    }

    @Data
    public static class PromptTokensDetails {
        @JsonProperty("cached_tokens")
        private Integer cachedTokens;

        @JsonProperty("audio_tokens")
        private Integer audioTokens;
    }

    @Data
    public static class CompletionTokensDetails {
        @JsonProperty("reasoning_tokens")
        private Integer reasoningTokens;

        @JsonProperty("audio_tokens")
        private Integer audioTokens;

        @JsonProperty("accepted_prediction_tokens")
        private Integer acceptedPredictionTokens;

        @JsonProperty("rejected_prediction_tokens")
        private Integer rejectedPredictionTokens;
    }
}
