package com.devteria.profile.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.dto.response.UserRelationshipResponse;
import com.devteria.profile.service.UserRelationshipService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("/relationship")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserRelationshipController {
    UserRelationshipService userRelationshipService;

    @PostMapping("send-friend-request/{receiverId}")
    public ApiResponse<UserRelationshipResponse> sendFriendRequest(@PathVariable String receiverId) {
        return ApiResponse.<UserRelationshipResponse>builder()
                .result(userRelationshipService.sendFriendRequest(receiverId))
                .build();
    }

    @PostMapping("accept-friend-request/{receiverId}")
    public ApiResponse<UserRelationshipResponse> acceptFriendRequest(@PathVariable String receiverId) {
        return ApiResponse.<UserRelationshipResponse>builder()
                .result(userRelationshipService.acceptFriendRequest(receiverId))
                .build();
    }

    @PostMapping("reject-friend-request/{senderId}")
    public ApiResponse<Boolean> rejectFriendRequest(@PathVariable String senderId) {
        return ApiResponse.<Boolean>builder()
                .result(userRelationshipService.rejectFriendRequest(senderId))
                .build();
    }

    @DeleteMapping("remove-friend/{receiverId}")
    public ApiResponse<Boolean> removeFriend(@PathVariable String receiverId) {
        return ApiResponse.<Boolean>builder()
                .result(userRelationshipService.removeFriend(receiverId))
                .build();
    }

    @GetMapping("are-friends")
    public ApiResponse<Boolean> areFriends(@RequestParam String userId1, @RequestParam String userId2) {
        boolean result = userRelationshipService.areFriends(userId1, userId2);
        return ApiResponse.<Boolean>builder().result(result).build();
    }

    @GetMapping("friends/{userId}")
    public ApiResponse<Page<UserProfileResponse>> getUserFriends(@PathVariable String userId, Pageable pageable) {
        return ApiResponse.<Page<UserProfileResponse>>builder()
                .result(userRelationshipService.getUserFriends(userId, pageable))
                .build();
    }

    @GetMapping("pending-requests")
    public ApiResponse<Page<UserProfileResponse>> getPendingFriendRequests(Pageable pageable) {
        return ApiResponse.<Page<UserProfileResponse>>builder()
                .result(userRelationshipService.getPendingFriendRequests(pageable))
                .build();
    }

    @GetMapping("my-friends")
    public ApiResponse<Page<UserProfileResponse>> getMyUserFriends(Pageable pageable) {
        return ApiResponse.<Page<UserProfileResponse>>builder()
                .result(userRelationshipService.getMyUserFriends(pageable))
                .build();
    }
}
