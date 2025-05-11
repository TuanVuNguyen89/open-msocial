package com.devteria.post.dto.request;

import com.devteria.post.entity.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostEventData {
    private String postId;
    private String userId;
    private String content;
    private Visibility visibility;
    private Instant createdDate;
    private Instant modifiedDate;
}
