package com.devteria.post.repository.httpclient;

import com.devteria.post.dto.ApiResponse;
import com.devteria.post.dto.response.UserProfileResponse;
import com.devteria.post.dto.response.UserRelationshipResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "profile-service", url = "${app.services.profile.url}")
public interface ProfileClient {
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);

    @GetMapping("/internal/users/get-by-id/{userId}")
    ApiResponse<UserProfileResponse> getProfileById(@PathVariable String userId);

    @GetMapping("/internal/relationship/friends/{userId}")
    ApiResponse<List<UserProfileResponse>> getFriendIds(@PathVariable String userId);

    @GetMapping("/internal/relationship/get-relationship")
    ApiResponse<UserRelationshipResponse> areFriends(@RequestParam String userId1, @RequestParam String userId2);
}
