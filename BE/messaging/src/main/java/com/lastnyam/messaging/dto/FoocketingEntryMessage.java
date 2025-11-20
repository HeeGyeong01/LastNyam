package com.lastnyam.messaging.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class FoocketingEntryMessage extends KafkaMessage<FoocketingEntryPayload> {
}
