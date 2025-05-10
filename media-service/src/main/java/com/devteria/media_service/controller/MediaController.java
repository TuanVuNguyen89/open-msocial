package com.devteria.media_service.controller;

import com.devteria.media_service.dto.*;
import com.devteria.media_service.dto.request.MetadataUpdateRequest;
import com.devteria.media_service.dto.response.MediaResponse;
import com.devteria.media_service.dto.response.MediaUploadResponse;
import com.devteria.media_service.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaUploadResponse>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerType") String ownerType,
            @RequestParam("ownerId") String ownerId  //Expect that the ownerId will be guid
    ) {
        MediaUploadResponse response = mediaService.upload(file, ownerType, ownerId);
        ApiResponse<MediaUploadResponse> apiResponse = ApiResponse.<MediaUploadResponse>builder()
                .result(response)
                .message("Media uploaded successfully")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponse>> getMedia(@PathVariable String id) {
        MediaResponse media = mediaService.getMediaById(id);
        ApiResponse<MediaResponse> apiResponse = ApiResponse.<MediaResponse>builder()
                .result(media)
                .message("Media retrieved successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .message("Media deleted successfully")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.NO_CONTENT); // or HttpStatus.OK
    }

    @PutMapping("/{id}/metadata")
    public ResponseEntity<ApiResponse<Void>> updateMetadata(@PathVariable String id, @RequestBody MetadataUpdateRequest metadataUpdateRequest) {
        mediaService.updateMetadata(id, metadataUpdateRequest.getMetadata());
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .message("Metadata updated successfully")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.NO_CONTENT);
    }

    @GetMapping(value = "/stream/{id}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> streamMedia(@PathVariable String id) {
        byte[] mediaStream = mediaService.streamMedia(id);
        return ResponseEntity.ok(mediaStream); //Streaming media returns byte[] directly
    }
}