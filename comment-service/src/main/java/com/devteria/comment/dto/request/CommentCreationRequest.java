package com.devteria.comment.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreationRequest {
    private String postId;
    private String userId;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
    private String parentId;
}
