package com.devteria.media_service.dto.response;

import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
public class MediaResponse {
    private String id;
    private String url;
    private String publicId;
    private String type;
    private String format;
    private Long size;
    private Date createdAt;
    private Date updatedAt;
    private Map<String, Object> metadata;
    private String ownerType;
    private String ownerId;
}
