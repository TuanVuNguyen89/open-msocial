package com.devteria.profile.controller;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.response.FriendRequestResponse;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.service.FriendRelationshipService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendController {
    FriendRelationshipService friendRelationshipService;

    /**
     * Send a friend request to another user
     */
    @PostMapping("/{targetUserId}/friend-request")
    public ApiResponse<FriendRequestResponse> sendFriendRequest(@PathVariable String targetUserId) {
        friendRelationshipService.sendFriendRequest(targetUserId);
        return ApiResponse.<FriendRequestResponse>builder()
                .result(friendRelationshipService.sendFriendRequest(targetUserId))
                .build();
    }

    /**
     * Accept a friend request
     */
    @PostMapping("/friend-requests/{requestId}/accept")
    public ApiResponse<UserProfileResponse> acceptFriendRequest(@PathVariable String requestId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(friendRelationshipService.acceptFriendRequest(requestId))
                .build();
    }
}
