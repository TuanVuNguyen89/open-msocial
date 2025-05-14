package com.devteria.media_service.controller;

import com.devteria.media_service.dto.*;
import com.devteria.media_service.dto.response.MediaResponse;
import com.devteria.media_service.dto.response.MediaUploadResponse;
import com.devteria.media_service.entity.Media;
import com.devteria.media_service.service.MediaService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MediaController {

    MediaService mediaService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MediaUploadResponse> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("postId") String postId
    ) {
        return ApiResponse.<MediaUploadResponse>builder()
                .result(mediaService.upload(file, postId))
                .message("Media uploaded successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<MediaResponse> getMedia(@PathVariable String id) {
        return ApiResponse.<MediaResponse>builder()
                .result(mediaService.getMediaById(id))
                .message("Media retrieved successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteMedia(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .result(mediaService.deleteMedia(id))
                .message("Media deleted successfully")
                .build();
    }

    /**
     * Endpoint để tải xuống media với tên file gốc
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadMedia(@PathVariable String id) {
        return mediaService.downloadMedia(id);
    }

    /**
     * Endpoint xem trước media (không tải xuống)
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewMedia(@PathVariable String id) {
        MediaResponse media = mediaService.getMediaById(id);
        // Chuyển hướng đến URL Cloudinary
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(media.getUrl()))
                .build();
    }
}