package com.devteria.media_service.util;

/**
 * Utility class for handling content types and media formats
 */
public class ContentTypeUtils {

    private ContentTypeUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Determine content type from file extension when contentType is not available
     */
    public static String determineContentTypeFromFileName(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }

        String extension = "";
        int i = fileName.lastIndexOf('.');
        if (i > 0) {
            extension = fileName.substring(i + 1).toLowerCase();
        }

        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "mp3" -> "audio/mpeg";
            case "mp4" -> "video/mp4";
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            case "7z" -> "application/x-7z-compressed";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }

    /**
     * Map content type to media type string
     */
    public static String determineMediaTypeFromContentType(String contentType) {
        if (contentType == null) {
            return "OTHER";
        }

        if (contentType.startsWith("image/")) {
            return "IMAGE";
        } else if (contentType.startsWith("video/")) {
            return "VIDEO";
        } else if (contentType.equals("application/pdf")) {
            return "PDF";
        } else if (contentType.startsWith("audio/")) {
            return "AUDIO";
        } else if (contentType.startsWith("text/")) {
            return "TEXT";
        } else if (contentType.contains("spreadsheet") ||
                contentType.contains("excel") ||
                contentType.equals("application/vnd.ms-excel") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return "SPREADSHEET";
        } else if (contentType.contains("document") ||
                contentType.contains("word") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return "DOCUMENT";
        } else if (contentType.contains("presentation") ||
                contentType.contains("powerpoint") ||
                contentType.equals("application/vnd.ms-powerpoint") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
            return "PRESENTATION";
        } else if (contentType.equals("application/zip") ||
                contentType.equals("application/x-rar-compressed") ||
                contentType.equals("application/x-7z-compressed")) {
            return "ARCHIVE";
        } else {
            return "OTHER";
        }
    }

    /**
     * Determine appropriate content type based on media type and format
     */
    public static String determineContentType(String mediaType, String format) {
        if (mediaType == null) {
            return "application/octet-stream";
        }

        switch (mediaType.toUpperCase()) {
            case "IMAGE":
                return "image/" + (format != null ? format.toLowerCase() : "jpeg");
            case "VIDEO":
                return "video/" + (format != null ? format.toLowerCase() : "mp4");
            case "AUDIO":
                return "audio/" + (format != null ? format.toLowerCase() : "mpeg");
            case "PDF":
                return "application/pdf";
            case "DOCUMENT":
                if (format != null && format.equalsIgnoreCase("doc")) {
                    return "application/msword";
                }
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "SPREADSHEET":
                if (format != null && format.equalsIgnoreCase("xls")) {
                    return "application/vnd.ms-excel";
                }
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "PRESENTATION":
                if (format != null && format.equalsIgnoreCase("ppt")) {
                    return "application/vnd.ms-powerpoint";
                }
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "TEXT":
                return "text/plain";
            case "ARCHIVE":
                if (format != null) {
                    if (format.equalsIgnoreCase("rar")) {
                        return "application/x-rar-compressed";
                    } else if (format.equalsIgnoreCase("7z")) {
                        return "application/x-7z-compressed";
                    }
                }
                return "application/zip";
            default:
                return "application/octet-stream";
        }
    }
}