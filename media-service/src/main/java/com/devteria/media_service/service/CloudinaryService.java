package com.devteria.media_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService { // No interface

    @Autowired
    private Cloudinary cloudinary;

    public Map upload(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        Map<String, Object> params = new HashMap<>();

        // Xử lý cụ thể cho các loại file
        if (contentType != null) {
            if (contentType.startsWith("video/")) {
                params.put("resource_type", "video");
            } else if (contentType.startsWith("image/")) {
                params.put("resource_type", "image");
                // Thêm các tùy chọn cho ảnh nếu cần
                params.put("transformation", "q_auto"); // Auto quality
            } else if (contentType.startsWith("audio/")) {
                params.put("resource_type", "video"); // Cloudinary xử lý audio dưới resource_type video
            } else if (contentType.equals("application/pdf") ||
                    contentType.contains("document") ||
                    contentType.contains("spreadsheet") ||
                    contentType.contains("presentation") ||
                    contentType.startsWith("text/")) {
                params.put("resource_type", "raw");
            } else {
                // Cho các loại file khác, sử dụng auto để Cloudinary tự phát hiện
                params.put("resource_type", "auto");
            }
        } else {
            // Nếu không xác định được contentType
            params.put("resource_type", "auto");
        }

        // Thêm các tùy chọn chung
        params.put("unique_filename", true);
        params.put("overwrite", false);

        // Giới hạn kích thước file dựa vào loại
        String resourceType = (String) params.get("resource_type");
        if ("image".equals(resourceType)) {
            // Giới hạn kích thước ảnh nếu cần
            // params.put("max_file_size", 10 * 1024 * 1024); // 10MB
        } else if ("video".equals(resourceType)) {
            // Giới hạn kích thước video nếu cần
            // params.put("max_file_size", 100 * 1024 * 1024); // 100MB
        }

        // Log để debug
        System.out.println("Uploading file: " + file.getOriginalFilename());
        System.out.println("Content type: " + contentType);
        System.out.println("Using resource_type: " + params.get("resource_type"));

        try {
            return cloudinary.uploader().upload(file.getBytes(), params);
        } catch (IOException e) {
            System.err.println("Cloudinary upload error: " + e.getMessage());
            throw e;
        }
    }

    // Xóa file từ Cloudinary theo publicId
    public void delete(String publicId, String resourceType) throws IOException {
        Map<String, Object> params = new HashMap<>();
        if (resourceType != null) {
            params.put("resource_type", mapResourceType(resourceType));
        }

        cloudinary.uploader().destroy(publicId, params);
    }
    // Chuyển đổi loại media trong hệ thống sang resource_type của Cloudinary
    private String mapResourceType(String mediaType) {
        if (mediaType == null) return "auto";

        switch(mediaType.toUpperCase()) {
            case "IMAGE":
                return "image";
            case "VIDEO":
            case "AUDIO":
                return "video";
            case "PDF":
            case "DOCUMENT":
            case "SPREADSHEET":
            case "PRESENTATION":
            case "TEXT":
                return "raw";
            default:
                return "auto";
        }
    }
}