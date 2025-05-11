package com.devteria.comment.service;

import com.devteria.comment.Mapper.CommentMapper;
import com.devteria.comment.dto.request.CommentCreationRequest;
import com.devteria.comment.dto.response.CommentResponse;
import com.devteria.comment.dto.response.UserProfileResponse;
import com.devteria.comment.entity.Comment;
import com.devteria.comment.exception.AppException;
import com.devteria.comment.exception.ErrorCode;
import com.devteria.comment.repository.CommentRepository;
import com.devteria.comment.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    CommentRepository commentRepository;
    ProfileClient profileClient;
    CommentMapper commentMapper;

    Comment getById(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
    }

    CommentResponse createComment(CommentCreationRequest request) {
        var currentUser = getUserProfileById(request.getUserId());
        var parentComment = getById(request.getParentId());
        var parentUser = getUserProfileById(parentComment.getUserId());

        var comment = Comment.builder()
                .postId(request.getPostId())
                .content(request.getContent())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .rootId(parentComment.getRootId() == null ? parentComment.getId() : parentComment.getRootId())
                .pUserId(parentComment.getUserId())
                .userId(currentUser.getId())
                .build();

        comment = commentRepository.save(comment);
        var commentResponse = CommentResponse.builder()
                                .user(currentUser)
                                .pUser(parentUser)
                                .rootId(comment.getRootId())
                                .id(comment.getId())
                                .content(comment.getContent())
                                .build();

        return commentResponse;
    }

    // Extension
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private UserProfileResponse getUserProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
            return null;
        }
    }

    private UserProfileResponse getUserProfileOrThrow(String userId) {
        UserProfileResponse userProfile = getUserProfile(userId);
        if (userProfile == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        return userProfile;
    }

    private UserProfileResponse getUserProfileById(String userId) {
        try {
            return profileClient.getProfileById(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
            return null;
        }
    }
}
