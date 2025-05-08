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
    private String id;
    private UserProfileResponse sender;
    private UserProfileResponse receiver;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
