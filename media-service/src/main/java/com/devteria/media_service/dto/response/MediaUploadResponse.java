package com.devteria.media_service.dto.response;

import lombok.Data;

@Data
public class MediaUploadResponse {
    private String id;
    private String url;
    private String type;
}