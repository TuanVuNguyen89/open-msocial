package com.devteria.media_service.exception;

public class MediaDownloadException extends RuntimeException {
    public MediaDownloadException(String message) {
        super(message);
    }

    public MediaDownloadException(String message, Throwable cause) {
        super(message, cause);
    }
}
