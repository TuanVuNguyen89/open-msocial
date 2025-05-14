package com.devteria.comment.entity;

import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@Document(value = "comment")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Comment {
    @MongoId
    private String id;

    private String postId;
    private String userId;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
    private String rootId;
    private String pUserId;
}
