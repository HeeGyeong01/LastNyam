package com.lastnyam.owner.external.gms.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AIModel {
    GPT5("gpt-5"),
    GPT5o_MINI("gpt-5-mini"),
    GPT4o("gpt-4o"),
    GPT41_MINI("gpt-4.1-mini"),
    GPT41_NANO("gpt-4.1-nano");

    private final String modelName;
}
