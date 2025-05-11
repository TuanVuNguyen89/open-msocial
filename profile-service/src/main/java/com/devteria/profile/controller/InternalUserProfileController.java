package com.devteria.profile.controller;

import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.service.FriendRelationshipService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.request.ProfileCreationRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserProfileController {
    UserProfileService userProfileService;
    FriendRelationshipService friendRelationshipService;
    @PostMapping("/internal/users")
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.createProfile(request))
                .build();
    }

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getByUserId(userId))
                .build();
    }

    @GetMapping("/internal/users/get-by-id/{id}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String id) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfile(id))
                .build();
    }

    /**
     * Get pending friend requests
     */
    @GetMapping("internal/users/relationship/{userid1}/{userid2}")
    public ApiResponse<Boolean> areFriends(
            @PathVariable String userid1,
            @PathVariable String userid2
    ) {
        return ApiResponse.<Boolean>builder()
                .result(friendRelationshipService.areFriends(userid1, userid2))
                .build();
    }

    /**
     * Get list of friends
     */
    @GetMapping("internal/users/{userId}/friends")
    public ApiResponse<ArrayList<UserProfile>> getUserFriends(
            @PathVariable String userId) {
        return ApiResponse.<ArrayList<UserProfile>>builder()
                .result(friendRelationshipService.getUserFriends(userId))
                .build();
    }
}
