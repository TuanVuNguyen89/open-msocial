package com.devteria.comment.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    private String id;
    private String content;
    private UserProfileResponse user;
    private UserProfileResponse pUser;
    private String rootId;
}

