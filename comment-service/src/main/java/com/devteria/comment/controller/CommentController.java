package com.devteria.comment.controller;

import org.springframework.web.bind.annotation.*;

import com.devteria.comment.dto.ApiResponse;
import com.devteria.comment.dto.request.CommentCreationRequest;
import com.devteria.comment.dto.request.CommentUpdateRequest;
import com.devteria.comment.dto.request.PageRequestDTO;
import com.devteria.comment.dto.response.CommentResponse;
import com.devteria.comment.dto.response.PageResponseDTO;
import com.devteria.comment.service.CommentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService commentService;

    @PostMapping("/create")
    public ApiResponse<CommentResponse> createComment(@RequestBody CommentCreationRequest request) {
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.createComment(request))
                .build();
    }

    @PutMapping("/update/{id}")
    public ApiResponse<CommentResponse> updateComment(
            @PathVariable String id, @RequestBody CommentUpdateRequest request) {
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.updateComment(id, request))
                .build();
    }

    @DeleteMapping("/delete/{id}")
    public ApiResponse<Boolean> deleteComment(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .result(commentService.deleteComment(id))
                .build();
    }

    @GetMapping("/post/{postId}/paginated")
    public ApiResponse<PageResponseDTO<CommentResponse>> getCommentsByPostIdPaginated(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequestDTO pageRequest =
                PageRequestDTO.builder().page(page).size(size).build();
        return ApiResponse.<PageResponseDTO<CommentResponse>>builder()
                .result(commentService.getCommentsByPostIdPaginated(postId, pageRequest))
                .build();
    }

    @GetMapping("/root/{rootId}/paginated")
    public ApiResponse<PageResponseDTO<CommentResponse>> getRepliesByRootIdPaginated(
            @PathVariable String rootId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequestDTO pageRequest =
                PageRequestDTO.builder().page(page).size(size).build();
        return ApiResponse.<PageResponseDTO<CommentResponse>>builder()
                .result(commentService.getRepliesByRootIdPaginated(rootId, pageRequest))
                .build();
    }

    @GetMapping("/post/{postId}/all/paginated")
    public ApiResponse<PageResponseDTO<CommentResponse>> getAllCommentsByPostIdPaginated(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequestDTO pageRequest =
                PageRequestDTO.builder().page(page).size(size).build();
        return ApiResponse.<PageResponseDTO<CommentResponse>>builder()
                .result(commentService.getAllCommentsByPostIdPaginated(postId, pageRequest))
                .build();
    }
}
