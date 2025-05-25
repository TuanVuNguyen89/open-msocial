package com.devteria.comment.service;

import java.time.Instant;

import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.devteria.comment.Mapper.CommentMapper;
import com.devteria.comment.dto.request.CommentCreationRequest;
import com.devteria.comment.dto.request.CommentUpdateRequest;
import com.devteria.comment.dto.request.PageRequestDTO;
import com.devteria.comment.dto.response.CommentResponse;
import com.devteria.comment.dto.response.PageResponseDTO;
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

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    CommentRepository commentRepository;
    ProfileClient profileClient;
    CommentMapper commentMapper;

    Comment getById(String id) {
        return commentRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
    }

    public CommentResponse createComment(CommentCreationRequest request) {
        String userId = getCurrentUserId();
        var currentUser = getUserProfileOrThrow(userId);
        var parentComment = request.getParentId() == null ? null : getById(request.getParentId());
        var parentUser = parentComment != null ? getUserProfileById(parentComment.getUserId()) : null;

        var comment = Comment.builder()
                .postId(request.getPostId())
                .content(request.getContent())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .userId(currentUser.getId())
                .build();

        if (parentComment != null) {
            comment.setRootId(parentComment.getRootId() == null ? parentComment.getId() : parentComment.getRootId());
            comment.setPUserId(parentComment.getUserId());
        }

        comment = commentRepository.save(comment);

        return CommentResponse.builder()
                .user(currentUser)
                .pUser(parentUser)
                .rootId(comment.getRootId())
                .id(comment.getId())
                .content(comment.getContent())
                .build();
    }

    public CommentResponse updateComment(String id, CommentUpdateRequest request) {
        String userId = getCurrentUserId();
        var currentUser = getUserProfileOrThrow(userId);
        var comment = getById(id);

        // Check if user is the owner of the comment
        if (!comment.getUserId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(Instant.now());
        comment = commentRepository.save(comment);

        var parentUser = comment.getPUserId() != null ? getUserProfileById(comment.getPUserId()) : null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .rootId(comment.getRootId())
                .user(currentUser)
                .pUser(parentUser)
                .build();
    }

    public boolean deleteComment(String id) {
        String userId = getCurrentUserId();
        var currentUser = getUserProfileOrThrow(userId);
        var comment = getById(id);

        // Check if user is the owner of the comment
        if (!comment.getUserId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        commentRepository.deleteById(id);
        return true;
    }

    public PageResponseDTO<CommentResponse> getCommentsByPostIdPaginated(String postId, PageRequestDTO pageRequest) {
        var pageable = pageRequest.toPageRequest(Sort.by(Sort.Direction.DESC, "createdAt"));
        var commentsPage = commentRepository.findByPostIdAndRootIdIsNullOrderByCreatedAtDesc(postId, pageable);

        var commentResponses = commentsPage.map(this::mapToResponse);
        return PageResponseDTO.from(commentResponses);
    }

    public PageResponseDTO<CommentResponse> getRepliesByRootIdPaginated(String rootId, PageRequestDTO pageRequest) {
        var pageable = pageRequest.toPageRequest(Sort.by(Sort.Direction.ASC, "createdAt"));
        var repliesPage = commentRepository.findByRootIdOrderByCreatedAtAsc(rootId, pageable);

        var replyResponses = repliesPage.map(this::mapToResponse);
        return PageResponseDTO.from(replyResponses);
    }

    public PageResponseDTO<CommentResponse> getAllCommentsByPostIdPaginated(String postId, PageRequestDTO pageRequest) {
        var pageable = pageRequest.toPageRequest(Sort.by(Sort.Direction.ASC, "createdAt"));
        var commentsPage = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable);

        var commentResponses = commentsPage.map(this::mapToResponse);
        return PageResponseDTO.from(commentResponses);
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

    private CommentResponse mapToResponse(Comment comment) {
        var user = getUserProfileById(comment.getUserId());
        var parentUser = comment.getPUserId() != null ? getUserProfileById(comment.getPUserId()) : null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .rootId(comment.getRootId())
                .user(user)
                .pUser(parentUser)
                .build();
    }
}
