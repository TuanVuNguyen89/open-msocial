package com.devteria.media_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.apache.catalina.User;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MediaResponse {
    private String id;
    private String url;
    private String postId;
    private String publicId;
    private String type;
    private String format;
    private Long size;
    private Instant createdAt;
    private UserProfileResponse userProfile;
}
