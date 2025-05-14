package com.devteria.profile.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.response.FriendRequestResponse;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.service.FriendRelationshipService;
import com.devteria.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendController {
    FriendRelationshipService friendRelationshipService;
    UserProfileService userProfileService;
    /**
     * Send a friend request to another user
     */
    @PostMapping("/{targetUserId}/friend-request")
    public ApiResponse<FriendRequestResponse> sendFriendRequest(@PathVariable String targetUserId) {
        return ApiResponse.<FriendRequestResponse>builder()
                .result(friendRelationshipService.sendFriendRequest(targetUserId))
                .build();
    }

    /**
     * Accept a friend request
     */
    @PostMapping("/{sourceUserId}/accept-friend-request")
    public ApiResponse<FriendRequestResponse> acceptFriendRequest(@PathVariable String sourceUserId) {
        return ApiResponse.<FriendRequestResponse>builder()
                .result(friendRelationshipService.acceptFriendRequest(sourceUserId))
                .build();
    }

    /**
     * Reject a friend request
     */
    @PostMapping("/{sourceUserId}/reject-friend-request")
    public ApiResponse<FriendRequestResponse> rejectFriendRequest(@PathVariable String senderUserId) {
        return ApiResponse.<FriendRequestResponse>builder()
                .result(friendRelationshipService.rejectFriendRequest(senderUserId))
                .build();
    }

    /**
     * Remove friendship
     */
    @DeleteMapping("/{userId}/friends/{targetUserId}")
    public ApiResponse<Boolean> removeFriend(@PathVariable String targetUserId) {
        return ApiResponse.<Boolean>builder()
                .result(friendRelationshipService.removeFriend(targetUserId))
                .build();
    }

    /**
     * Follow a user
     */
    @PostMapping("/{targetUserId}/follow")
    public ApiResponse<Boolean> follow(@PathVariable String targetUserId) {
        return ApiResponse.<Boolean>builder()
                .result(friendRelationshipService.followUser(targetUserId))
                .build();
    }

    /**
     * Unfollow a user
     */
    @DeleteMapping("/{targetUserId}/unfollow")
    public ApiResponse<Boolean> unfollowUser(@PathVariable String targetUserId) {
        return ApiResponse.<Boolean>builder()
                .result(friendRelationshipService.unfollowUser(targetUserId))
                .build();
    }

    /**
     * Get list of friends
     */
    @GetMapping("/{userId}/friends")
    public ApiResponse<Page<UserProfile>> getUserFriends(@PathVariable String userId, Pageable pageable) {
        return ApiResponse.<Page<UserProfile>>builder()
                .result(friendRelationshipService.getUserFriends(userId, pageable))
                .build();
    }

    /**
     * Get list of followers
     */
    @GetMapping("/{userId}/followers")
    public ApiResponse<Page<UserProfile>> getUserFollowers(@PathVariable String userId, Pageable pageable) {
        return ApiResponse.<Page<UserProfile>>builder()
                .result(friendRelationshipService.getUserFollowers(userId, pageable))
                .build();
    }

    /**
     * Get list of users being followed
     */
    @GetMapping("/{userId}/following")
    public ApiResponse<Page<UserProfile>> getUserFollowing(@PathVariable String userId, Pageable pageable) {
        return ApiResponse.<Page<UserProfile>>builder()
                .result(friendRelationshipService.getUserFollowing(userId, pageable))
                .build();
    }

    /**
     * Get pending friend requests
     */
    @GetMapping("/friend-requests/pending")
    public ApiResponse<Page<UserProfile>> getPendingFriendRequests(Pageable pageable) {
        return ApiResponse.<Page<UserProfile>>builder()
                .result(friendRelationshipService.getPendingFriendRequests(pageable))
                .build();
    }
}
