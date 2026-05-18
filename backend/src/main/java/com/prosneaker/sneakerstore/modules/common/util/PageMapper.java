package com.prosneaker.sneakerstore.modules.common.util;

import com.prosneaker.sneakerstore.modules.common.dto.PageResponse;
import org.springframework.data.domain.Page;

import java.util.function.Function;

public final class PageMapper {

    private PageMapper() {
    }

    public static <T, R> PageResponse<R> toPageResponse(Page<T> page, Function<T, R> mapper) {
        return PageResponse.<R>builder()
                .content(page.getContent().stream().map(mapper).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
