package com.devteria.notification.controller;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.devteria.event.dto.NotificationEvent;
import com.devteria.notification.dto.request.SendEmailRequest;
import com.devteria.notification.dto.request.To;
import com.devteria.notification.service.EmailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    EmailService emailService;

    @KafkaListener(topics = "notification-delivery")
    public void listenNotificationDelivery(NotificationEvent message) {
        log.info("Message received: {}", message);
        emailService.sendEmail(SendEmailRequest.builder()
                .to(To.builder().email(message.getRecipient()).build())
                .subject(message.getSubject())
                .content(message.getBody())
                .build());
    }
}
