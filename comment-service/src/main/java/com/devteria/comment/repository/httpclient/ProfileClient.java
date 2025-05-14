package com.devteria.comment.repository.httpclient;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.devteria.comment.dto.ApiResponse;
import com.devteria.comment.dto.response.UserProfileResponse;

@FeignClient(name = "profile-service", url = "${app.services.profile.url}")
public interface ProfileClient {
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);

    @GetMapping("/internal/users/get-by-id/{userId}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String userId);

    @GetMapping("/internal/users/{userId}/friends")
    ApiResponse<List<String>> getFriendIds(@PathVariable String userId);

    @GetMapping("/internal/users/relationship/{userId1}/{userId2}")
    ApiResponse<Boolean> areFriends(@PathVariable String userId1, @PathVariable String userId2);
}
