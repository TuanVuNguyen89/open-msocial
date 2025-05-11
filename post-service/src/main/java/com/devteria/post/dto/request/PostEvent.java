package com.devteria.post.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostEvent {
    private String eventId;
    private String eventType;
    private Instant timestamp;
    private PostEventData data;
}
