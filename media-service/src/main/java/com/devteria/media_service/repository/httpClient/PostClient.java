package com.devteria.media_service.repository.httpClient;

import com.devteria.media_service.dto.ApiResponse;
import com.devteria.media_service.dto.response.PostResponse;
import com.devteria.media_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "post-service", url = "${app.services.post.url}")
public interface PostClient {
    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPost(@PathVariable String postId, @RequestHeader("Authorization") String authHeader);
}
