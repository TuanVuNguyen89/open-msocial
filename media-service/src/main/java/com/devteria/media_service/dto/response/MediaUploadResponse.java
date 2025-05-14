package com.devteria.media_service.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class MediaUploadResponse {
    private String id;
    private String url;
    private String publicId;
    private String type;
    private String format;
    private Long size;
    private Integer width;
    private Integer height;
    private Integer duration;
    private String originalFilename;
    private String userId;
    private Instant createdAt;
}