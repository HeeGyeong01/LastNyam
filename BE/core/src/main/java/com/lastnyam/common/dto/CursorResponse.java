package com.lastnyam.common.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorResponse<T> {

    private List<T> content;
    private String nextCursor;
    private boolean hasNextPage;
}
