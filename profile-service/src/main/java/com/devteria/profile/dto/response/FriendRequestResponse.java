package com.devteria.profile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private String status;      // PENDING, ACCEPTED, REJECTED, ALREADY_FRIENDS, NOT_FOUND
    private String message;
    private String targetUserId;
}
