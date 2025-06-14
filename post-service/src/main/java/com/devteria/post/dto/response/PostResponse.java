package com.devteria.post.dto.response;

import com.devteria.post.entity.Visibility;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String content;
    UserProfileResponse user;
    String created;
    Instant createdDate;
    Instant modifiedDate;
    Visibility visibility;
}
