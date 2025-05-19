package com.devteria.media_service.service;

import com.devteria.media_service.dto.request.MediaUploadRequest;
import com.devteria.media_service.dto.response.MediaResponse;
import com.devteria.media_service.dto.response.MediaUploadResponse;
import com.devteria.media_service.dto.response.PostResponse;
import com.devteria.media_service.dto.response.UserProfileResponse;
import com.devteria.media_service.entity.Media;
import com.devteria.media_service.exception.*;
import com.devteria.media_service.mapper.MediaMapper;
import com.devteria.media_service.repository.MediaRepository;
import com.devteria.media_service.repository.httpClient.PostClient;
import com.devteria.media_service.repository.httpClient.ProfileClient;
import com.devteria.media_service.util.ContentTypeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {
    private final MediaRepository mediaRepository;
    private final CloudinaryService cloudinaryService;
    private final MediaMapper mediaMapper;
    private final ProfileClient profileClient;
    private final PostClient postClient;

    /**
     * Upload media file to Cloudinary and save metadata to database
     */
    public MediaUploadResponse upload(MultipartFile file, String postId) {
        //log.debug("Uploading media for postId: {}", postId);
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String token;

        if (authentication instanceof JwtAuthenticationToken jwtAuthToken) {
            token = jwtAuthToken.getToken().getTokenValue();
        } else {
            throw new IllegalStateException("Authentication không phải JwtAuthenticationToken");
        }

        var authHeader = "Bearer " + token;
        String userId = getCurrentUserId();
        UserProfileResponse userProfile = getUserProfile(userId);

        if (postId != null) {
            PostResponse post = postClient.getPost(postId, authHeader).getResult();
            if (!post.getUserId().equals(userProfile.getId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        validateFile(file);

        try {
            String contentType = Optional.ofNullable(file.getContentType())
                    .orElseGet(() -> ContentTypeUtils.determineContentTypeFromFileName(file.getOriginalFilename()));

            String mediaTypeStr = ContentTypeUtils.determineMediaTypeFromContentType(contentType);

            Map<String, Object> uploadResult = cloudinaryService.upload(file);

            Media media = buildMediaEntity(file, postId, uploadResult, mediaTypeStr, userProfile.getId());
            Media savedMedia = mediaRepository.save(media);

            log.info("Media uploaded successfully with id: {}", savedMedia.getId());
            return mediaMapper.mediaToMediaUploadResponse(savedMedia);
        } catch (IOException e) {
            log.error("Failed to upload media", e);
            throw new MediaUploadException("Error uploading to Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Download media file from Cloudinary
     */
    public ResponseEntity<Resource> downloadMedia(String mediaId) {
        log.debug("Downloading media with id: {}", mediaId);

        Media media = findMediaById(mediaId);

        try {
            URL cloudinaryUrl = new URL(media.getUrl());
            HttpURLConnection connection = (HttpURLConnection) cloudinaryUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000); // 10 seconds timeout for connection
            connection.setReadTimeout(30000);    // 30 seconds timeout for reading

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.error("Failed to download media, server returned status code: {}", responseCode);
                throw new MediaDownloadException("Server returned error code: " + responseCode);
            }

            InputStream inputStream = connection.getInputStream();
            InputStreamResource resource = new InputStreamResource(inputStream);

            String contentType = ContentTypeUtils.determineContentType(media.getType(), media.getFormat());
            String originalFilename = getOriginalFilename(media);
            String contentDisposition = createContentDisposition(originalFilename);

            log.debug("Media download prepared for id: {}", mediaId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (java.net.SocketTimeoutException e) {
            log.error("Connection timed out while downloading media: {}", mediaId, e);
            throw new MediaDownloadException("Connection timed out while accessing the file. Please try again later.");
        } catch (java.net.ConnectException e) {
            log.error("Failed to connect to media server for id: {}", mediaId, e);
            throw new MediaDownloadException("Unable to connect to media server. Please try again later.");
        } catch (IOException e) {
            log.error("Failed to download media", e);
            throw new MediaDownloadException("Error downloading media: " + e.getMessage());
        }
    }

    /**
     * Get media by ID with user profile information
     */
    public MediaResponse getMediaById(String mediaId) {
        log.debug("Getting media with id: {}", mediaId);

        Media media = findMediaById(mediaId);
        UserProfileResponse userProfile = getUserProfileById(media.getUserId());

        MediaResponse response = mediaMapper.mediaToMediaResponse(media);
        response.setUserProfile(userProfile);

        return response;
    }

    /**
     * Delete media from Cloudinary and database
     */
    public Boolean deleteMedia(String mediaId) {
        log.debug("Deleting media with id: {}", mediaId);

        Media media = findMediaById(mediaId);

        try {
            cloudinaryService.delete(media.getPublicId(), media.getType());
            mediaRepository.delete(media);
            log.info("Media deleted successfully with id: {}", mediaId);
            return true;
        } catch (IOException e) {
            log.error("Failed to delete media", e);
            throw new MediaDeletionException("Error deleting media: " + e.getMessage());
        }
    }

    // Private helper methods

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new MediaUploadException("File is empty");
        }
    }

    private Media buildMediaEntity(MultipartFile file, String postId, Map<String, Object> uploadResult, String mediaType, String userId) {
        String url = (String) uploadResult.get("url");
        String publicId = (String) uploadResult.get("public_id");
        String format = (String) uploadResult.get("format");

        Integer width = uploadResult.get("width") instanceof Integer ? (Integer) uploadResult.get("width") : null;
        Integer height = uploadResult.get("height") instanceof Integer ? (Integer) uploadResult.get("height") : null;
        Integer duration = uploadResult.get("duration") instanceof Integer ? (Integer) uploadResult.get("duration") : null;

        return Media.builder()
                .url(url)
                .publicId(publicId)
                .type(mediaType)
                .format(format)
                .size(file.getSize())
                .width(width)
                .height(height)
                .duration(duration)
                .originalFilename(file.getOriginalFilename())
                .userId(userId)
                .createdAt(Instant.now())
                .postId(postId)
                .build();
    }

    private Media findMediaById(String mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new MediaNotFoundException("Media not found with id: " + mediaId));
    }

    private String getOriginalFilename(Media media) {
        return Optional.ofNullable(media.getOriginalFilename())
                .filter(name -> !name.isEmpty())
                .orElse(media.getPublicId().replace("/", "_") + "." + media.getFormat());
    }

    private String createContentDisposition(String originalFilename) {
        String encodedFilename = URLEncoder.encode(originalFilename, StandardCharsets.UTF_8)
                .replace("+", "%20");
        return String.format("attachment; filename=\"%s\"; filename*=UTF-8''%s",
                originalFilename.replaceAll("\"", "\\\\\""), encodedFilename);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserProfileResponse getUserProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.error("Error getting user profile for userId: {}", userId, e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    private UserProfileResponse getUserProfileById(String userId) {
        try {
            return profileClient.getProfileById(userId).getResult();
        } catch (Exception e) {
            log.error("Error getting user profile for userId: {}", userId, e);
            return null;
        }
    }
}