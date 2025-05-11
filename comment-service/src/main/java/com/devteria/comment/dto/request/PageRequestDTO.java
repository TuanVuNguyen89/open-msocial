package com.devteria.comment.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageRequestDTO {
    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    public PageRequest toPageRequest() {
        return PageRequest.of(page, size);
    }

    public PageRequest toPageRequest(Sort sort) {
        return PageRequest.of(page, size, sort);
    }
}