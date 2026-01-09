package com.novelweb.common.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private final List<T> items;
    private final long total;
    private final int page;
    private final int size;
}
