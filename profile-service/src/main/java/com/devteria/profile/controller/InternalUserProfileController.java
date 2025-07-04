package com.devteria.profile.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.request.ProfileCreationRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.dto.response.UserRelationshipResponse;
import com.devteria.profile.service.UserProfileService;
import com.devteria.profile.service.UserRelationshipService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserProfileController {
    UserProfileService userProfileService;
    UserRelationshipService userRelationshipService;

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

    @GetMapping("/internal/relationship/friends/{userId}")
    public ApiResponse<List<UserProfileResponse>> getUserFriends(@PathVariable String userId) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userRelationshipService.getUserFriends(userId))
                .build();
    }

    @GetMapping("/internal/relationship/get-relationship")
    public ApiResponse<UserRelationshipResponse> getRelationships(
            @RequestParam String userId1, @RequestParam String userId2) {
        return ApiResponse.<UserRelationshipResponse>builder()
                .result(userRelationshipService.getRelationship(userId1, userId2))
                .build();
    }
}
