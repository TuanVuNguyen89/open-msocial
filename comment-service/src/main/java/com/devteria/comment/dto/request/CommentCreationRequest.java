package com.devteria.comment.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreationRequest {
    private String postId;
    private String content;
    private String parentId;
}
