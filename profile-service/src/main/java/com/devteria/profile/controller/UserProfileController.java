package com.devteria.profile.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.devteria.profile.dto.ApiResponse;
import com.devteria.profile.dto.request.ProfileUpdateRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.service.UserProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    /**
     * Get profile by profile ID
     */
    @GetMapping("/{id}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String id) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfile(id))
                .build();
    }

    @GetMapping("/search")
    ApiResponse<UserProfileResponse> getProfileByUsername(@RequestParam String username) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getByUsername(username))
                .build();
    }

    /**
     * Get all user profiles (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    /**
     * Get current user's profile
     */
    @GetMapping("my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    /**
     * Update user profile
     */
    @PutMapping("/{id}")
    public ApiResponse<UserProfileResponse> updateProfile(
            @PathVariable String id, @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateProfile(id, request))
                .build();
    }
}
