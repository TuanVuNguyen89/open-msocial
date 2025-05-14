package com.devteria.media_service.entity;

/**
 * Enum representing different types of media files
 */
public enum MediaType {
    IMAGE,
    VIDEO,
    AUDIO,
    PDF,
    DOCUMENT,
    SPREADSHEET,
    PRESENTATION,
    TEXT,
    ARCHIVE,
    OTHER;

    /**
     * Convert string to MediaType enum safely
     */
    public static MediaType fromString(String type) {
        if (type == null) {
            return OTHER;
        }

        try {
            return MediaType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
