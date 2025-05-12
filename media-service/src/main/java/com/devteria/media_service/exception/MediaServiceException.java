package com.devteria.media_service.exception;

public abstract class MediaServiceException extends RuntimeException {
    public MediaServiceException(String message) {
        super(message);
    }

    public MediaServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}