package com.devteria.media_service.exception;

public class MediaNotFoundException extends MediaServiceException {
    public MediaNotFoundException(String message) {
        super(message);
    }
}