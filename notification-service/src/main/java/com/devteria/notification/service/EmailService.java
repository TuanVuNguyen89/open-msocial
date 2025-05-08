package com.devteria.notification.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.devteria.notification.dto.request.*;
import com.devteria.notification.dto.response.EmailResponse;
import com.devteria.notification.exception.AppException;
import com.devteria.notification.exception.ErrorCode;
import com.devteria.notification.repository.httpclient.EmailClient;

import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {
    EmailClient emailClient;

    @Value("${notification.email.sendgrid-apikey}")
    @NonFinal
    String apiKey;

    public EmailResponse sendEmail(SendEmailRequest request) {
        EmailRequest emailRequest = EmailRequest.builder()
                .from(From.builder()
                        .name("Vu Nguyen")
                        .email("contact@ntuanvu89.id.vn")
                        .build())
                .personalizations(List.of(Personalization.builder()
                        .to(List.of(To.builder()
                                .email(request.getTo().getEmail())
                                .name(request.getTo().getName())
                                .build()))
                        .subject(request.getSubject())
                        .build()))
                .content(List.of(Content.builder()
                        .type("text/plain")
                        .value(request.getContent())
                        .build()))
                .build();
        try {
            String authHeader = "Bearer " + apiKey;
            return emailClient.sendEmail(authHeader, emailRequest);
        } catch (FeignException e) {
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
