package com.devteria.media_service.service;

import com.devteria.media_service.dto.*;
import com.devteria.media_service.dto.response.MediaResponse;
import com.devteria.media_service.dto.response.MediaUploadResponse;
import com.devteria.media_service.exception.*;
import com.devteria.media_service.entity.Media;
import com.devteria.media_service.mapper.MediaMapper;
import com.devteria.media_service.repository.MediaRepository;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private MediaMapper mediaMapper;

    public MediaUploadResponse upload(MultipartFile file, String ownerType, String ownerId) {
        try {
            // 1. Validation
            if (file == null || file.isEmpty()) {
                throw new MediaUploadException("File is empty");
            }

            // 2. Upload to Cloudinary
            Map uploadResult = cloudinaryService.upload(file);
            String url = (String) uploadResult.get("url");
            String publicId = (String) uploadResult.get("public_id");
            String format = (String) uploadResult.get("format");
            Long size = file.getSize();

            // 3. Create Media object
            Media media = new Media();
            media.setUrl(url);
            media.setPublicId(publicId);
            media.setType(determineMediaType(format));
            media.setFormat(format);
            media.setSize(size);
            media.setOwnerType(ownerType);
            media.setOwnerId(ownerId);
            media.setCreatedAt(new Date()); // Set thời gian tạo

            // 4. Save to database
            Media savedMedia = mediaRepository.save(media);

            // 5. Create and return DTO
            return mediaMapper.mediaToMediaUploadResponse(savedMedia);


        } catch (IOException e) {
            throw new MediaUploadException("Error uploading to Cloudinary: " + e.getMessage());
        }
    }

    private String determineMediaType(String format) {
        if (format != null) {
            format = format.toLowerCase();
            if (format.matches("jpg|jpeg|png|gif|bmp|webp")) {
                return "IMAGE";
            } else if (format.matches("mp4|avi|mov|wmv")) {
                return "VIDEO";
            }
        }
        return "UNKNOWN"; // Or throw exception if not supported
    }

    public MediaResponse getMediaById(String mediaId) {
        Media media = mediaRepository.findById(mediaId).orElseThrow(() -> new MediaNotFoundException("Media not found with id: " + mediaId));
        return mediaMapper.mediaToMediaResponse(media);
    }

    public Media getMediaByUrl(String mediaUrl) {
        return mediaRepository.findByUrl(mediaUrl).orElseThrow(() -> new MediaNotFoundException("Media not found with URL: " + mediaUrl));
    }

    public void deleteMedia(String mediaId) {
        Media media = mediaRepository.findById(mediaId).orElseThrow(() -> new MediaNotFoundException("Media not found with id: " + mediaId));
        try {
            cloudinaryService.delete(media.getPublicId());
            mediaRepository.delete(media);
        } catch (IOException e) {
            throw new MediaDeletionException("Error deleting media: " + e.getMessage());
        }
    }

    public void updateMetadata(String mediaId, Map<String, Object> metadata) {
        Media media = mediaRepository.findById(mediaId).orElseThrow(() -> new MediaNotFoundException("Media not found with id: " + mediaId));
        media.setMetadata(metadata);
        media.setUpdatedAt(new Date()); // Update updatedAt
        mediaRepository.save(media);
    }

    public byte[] streamMedia(String mediaId) {
        Media media = mediaRepository.findById(mediaId).orElseThrow(() -> new MediaNotFoundException("Media not found with id: " + mediaId));
        try {
            return downloadMediaFromCloudinary(media.getUrl());
        } catch (IOException e) {
            throw new MediaStreamingException("Error streaming media: " + e.getMessage());
        }
    }

    private byte[] downloadMediaFromCloudinary(String mediaUrl) throws IOException {
        try (InputStream in = new URL(mediaUrl).openStream()) {
            return IOUtils.toByteArray(in);
        }
    }
}