package com.devteria.profile.service;

import com.devteria.profile.dto.response.FriendRequestResponse;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.entity.FriendRequest;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.exception.AppException;
import com.devteria.profile.exception.ErrorCode;
import com.devteria.profile.mapper.UserProfileMapper;
import com.devteria.profile.repository.FriendRequestRepository;
import com.devteria.profile.repository.UserProfileRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FriendRelationshipService {
    UserProfileRepository userProfileRepository;
    FriendRequestRepository friendRequestRepository;
    UserProfileMapper userProfileMapper;

    /**
     * Send a friend request to another user
     */
    public FriendRequestResponse sendFriendRequest(String targetUserId) {
        // Get current user
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Check if users exist
        UserProfile sender = userProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserProfile target = userProfileRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check if request already exists
        if (friendRequestRepository.existsBySenderIdAndReceiverId(sender.getId(), target.getId())) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_ALREADY_SENT);
        }

        // Check if they are already friends
        if (userProfileRepository.areFriends(sender.getId(), target.getId())) {
            throw new AppException(ErrorCode.ALREADY_FRIENDS);
        }

        // Create friend request
        FriendRequest request = new FriendRequest();
        request.setSenderId(sender.getId());
        request.setReceiverId(target.getId());
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        request = friendRequestRepository.save(request);

        return mapToFriendRequestResponse(request, sender, target);
    }

    /**
     * Accept a friend request
     */
    public UserProfileResponse acceptFriendRequest(String requestId) {
        // Get current user
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        UserProfile currentUser = userProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Find the request
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // Verify current user is the receiver
        if (!request.getReceiverId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if request is pending
        if (!request.getStatus().equals("PENDING")) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_ALREADY_PROCESSED);
        }

        // Find sender
        UserProfile sender = userProfileRepository.findById(request.getSenderId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Update request status
        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDateTime.now());
        friendRequestRepository.save(request);

        // Create friendship in Neo4j
        userProfileRepository.createFriendship(currentUser.getId(), sender.getId());

        return userProfileMapper.toUserProfileReponse(sender);
    }

    /**
     * Helper method to map to response
     */
    private FriendRequestResponse mapToFriendRequestResponse(FriendRequest request, UserProfile sender, UserProfile receiver) {
        return FriendRequestResponse.builder()
                .id(request.getId())
                .sender(userProfileMapper.toUserProfileReponse(sender))
                .receiver(userProfileMapper.toUserProfileReponse(receiver))
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
