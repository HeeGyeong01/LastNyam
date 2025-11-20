package com.lastnyam.foocketingsubscriber.event;

import com.lastnyam.messaging.dto.FoocketingEntryPayload;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoocketingEntryCompleteEvent {

    private FoocketingEntryPayload payload;
}
