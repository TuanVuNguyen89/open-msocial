package com.devteria.media_service.dto.request;

import lombok.Data;

import java.util.Map;

@Data
public class MetadataUpdateRequest {
    private Map<String, Object> metadata;
}