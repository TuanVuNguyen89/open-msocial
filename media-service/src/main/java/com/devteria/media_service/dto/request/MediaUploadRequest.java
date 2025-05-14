package com.devteria.media_service.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class MediaUploadRequest {
    private MultipartFile file;
    private String postId;
}