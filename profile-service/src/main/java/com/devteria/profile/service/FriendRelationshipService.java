package com.devteria.profile.service;

import com.devteria.profile.dto.response.FriendRequestResponse;
import com.devteria.profile.entity.FriendRequestRelationship;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.exception.AppException;
import com.devteria.profile.exception.ErrorCode;
import com.devteria.profile.mapper.UserProfileMapper;
import com.devteria.profile.repository.FriendRequestRepository;
import com.devteria.profile.repository.UserProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FriendRelationshipService {
    UserProfileRepository userProfileRepository;
    UserProfileService userProfileService;
    FriendRequestRepository friendRequestRepository;
    UserProfileMapper userProfileMapper;

    /**
     * Send a friend request to another user
     * @param targetUserId ID of the user to send friend request to
     * @return FriendRequestResponse with status
     */
    public FriendRequestResponse sendFriendRequest(String targetUserId) {
        // Get sender (current user) and receiver profiles
        UserProfile sender = getCurrentUserProfile();
        UserProfile receiver = userProfileRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check if users are already friends
        if (areFriends(sender.getId(), targetUserId)) {
            return FriendRequestResponse.builder()
                    .status("ALREADY_FRIENDS")
                    .message("Users are already friends")
                    .targetUserId(targetUserId)
                    .build();
        }

        // Check if there's an existing request
        Optional<FriendRequestRelationship> existingRequest = sender.getSentFriendRequests().stream()
                .filter(req -> req.getReceiver().getId().equals(targetUserId))
                .findFirst();

        if (existingRequest.isPresent()) {
            return FriendRequestResponse.builder()
                    .status(existingRequest.get().getStatus())
                    .message("Friend request already exists")
                    .targetUserId(targetUserId)
                    .build();
        }

        // Check if there's a pending request from target user to current user
        Optional<FriendRequestRelationship> incomingRequest = sender.getReceivedFriendRequests().stream()
                .filter(req -> req.getReceiver().getId().equals(receiver.getId()) && req.getStatus().equals("PENDING"))
                .findFirst();

        if (incomingRequest.isPresent()) {
            // Auto-accept the request
            return acceptFriendRequest(targetUserId);
        }

        // Create and save new friend request
        FriendRequestRelationship friendRequest = new FriendRequestRelationship(receiver);

        if (sender.getSentFriendRequests() == null) {
            sender.setSentFriendRequests(new HashSet<>());
        }

        sender.getSentFriendRequests().add(friendRequest);
        userProfileRepository.save(sender);

        return FriendRequestResponse.builder()
                .status("PENDING")
                .message("Friend request sent successfully")
                .targetUserId(targetUserId)
                .build();
    }

    /**
     * Accept a friend request from another user
     * @param senderUserId ID of the user who sent the friend request
     * @return FriendRequestResponse with status
     */
    public FriendRequestResponse acceptFriendRequest(String senderUserId) {
        UserProfile currentUser = getCurrentUserProfile();
        UserProfile sourceUser = userProfileRepository.findById(senderUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Find the pending request
        Optional<FriendRequestRelationship> pendingRequest = currentUser.getReceivedFriendRequests().stream()
                .filter(req -> req.getReceiver().getId().equals(sourceUser.getId()) && req.getStatus().equals("PENDING"))
                .findFirst();

        if (pendingRequest.isEmpty()) {
            return FriendRequestResponse.builder()
                    .status("NOT_FOUND")
                    .message("No pending friend request found from this user")
                    .targetUserId(senderUserId)
                    .build();
        }

        // Update request status
        FriendRequestRelationship request = pendingRequest.get();
        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDateTime.now());

        // Create bidirectional friendship
        if (currentUser.getFriends() == null) {
            currentUser.setFriends(new HashSet<>());
        }
        if (sourceUser.getFriends() == null) {
            sourceUser.setFriends(new HashSet<>());
        }

        currentUser.getFriends().add(sourceUser);
        sourceUser.getFriends().add(currentUser);

        // Save both users
        userProfileRepository.save(currentUser);
        userProfileRepository.save(sourceUser);

        return FriendRequestResponse.builder()
                .status("ACCEPTED")
                .message("Friend request accepted")
                .targetUserId(senderUserId)
                .build();
    }

    /**
     * Reject a friend request
     * @param sourceUserId ID of the user who sent the friend request
     * @return FriendRequestResponse with status
     */
    public FriendRequestResponse rejectFriendRequest(String sourceUserId) {
        UserProfile currentUser = getCurrentUserProfile();
        UserProfile sourceUser = userProfileRepository.findById(sourceUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Find the pending request
        Optional<FriendRequestRelationship> pendingRequest = currentUser.getReceivedFriendRequests().stream()
                .filter(req -> req.getReceiver().getId().equals(sourceUser.getId()) && req.getStatus().equals("PENDING"))
                .findFirst();

        if (pendingRequest.isEmpty()) {
            return FriendRequestResponse.builder()
                    .status("NOT_FOUND")
                    .message("No pending friend request found from this user")
                    .targetUserId(sourceUserId)
                    .build();
        }

        // Update request status
        FriendRequestRelationship request = pendingRequest.get();
        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDateTime.now());

        // Save the updated relationship
        userProfileRepository.save(currentUser);

        return FriendRequestResponse.builder()
                .status("REJECTED")
                .message("Friend request rejected")
                .targetUserId(sourceUserId)
                .build();
    }

    /**
     * Remove friendship between two users
     * @param targetUserId ID of friend to remove
     * @return true if successful
     */
    public boolean removeFriend(String targetUserId) {
        UserProfile currentUser = getCurrentUserProfile();
        UserProfile targetUser = userProfileRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check if they are friends
        if (!areFriends(currentUser.getId(), targetUserId)) {
            return false;
        }

        // Remove friendship on both sides
        currentUser.getFriends().removeIf(friend -> friend.getId().equals(targetUserId));
        targetUser.getFriends().removeIf(friend -> friend.getId().equals(currentUser.getId()));

        // Save both users
        userProfileRepository.save(currentUser);
        userProfileRepository.save(targetUser);

        return true;
    }

    /**
     * Check if two users are friends
     * @param userId1 first user ID
     * @param userId2 second user ID
     * @return true if users are friends
     */
    public boolean areFriends(String userId1, String userId2) {
        return userProfileRepository.areFriends(userId1, userId2);
    }

    /**
     * Get the current authenticated user ID
     * @return current user ID from security context
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    /**
     * Get the current user profile
     * @return UserProfile of current authenticated user
     */
    private UserProfile getCurrentUserProfile() {
        String userId = getCurrentUserId();
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    /**
     * Follow another user
     * @param targetUserId ID of user to follow
     * @return true if successful
     */
    public boolean followUser(String targetUserId) {
        return userProfileService.followUser(targetUserId);
    }

    /**
     * Unfollow a user
     * @param targetUserId ID of user to unfollow
     * @return true if successful
     */
    public boolean unfollowUser(String targetUserId) {
        return userProfileService.unfollowUser(targetUserId);
    }

    /**
     * Get all friends of a user
     * @param userId ID of the user
     * @param pageable pagination information
     * @return Page of user profile DTOs
     */
    public Page<UserProfile> getUserFriends(String userId, Pageable pageable) {
        // Check if accessing own friends or if permission allows viewing others' friends
        String currentUserId = getCurrentUserProfile().getId();
        if (!userId.equals(currentUserId)) {
            //throw new AppException(ErrorCode.USER_NOT_EXISTED);
            //handle later
        }

        return userProfileRepository.findFriendsOfUser(userId, pageable)
                .map(userProfileService::convertToDto);
    }

    /**
     * Get all friends of a user
     * @param id ID of the user
     * @return Page of user profile DTOs
     */
    public ArrayList<UserProfile> getUserFriends(String id) {
        return userProfileRepository.findFriendsOfUser(id);
    }

    /**
     * Get all followers of a user
     * @param userId ID of the user
     * @param pageable pagination information
     * @return Page of user profile DTOs
     */
    public Page<UserProfile> getUserFollowers(String userId, Pageable pageable) {
        return userProfileRepository.findFollowersOfUser(userId, pageable)
                .map(userProfileService::convertToDto);
    }

    /**
     * Get all users followed by a user
     * @param userId ID of the user
     * @param pageable pagination information
     * @return Page of user profile DTOs
     */
    public Page<UserProfile> getUserFollowing(String userId, Pageable pageable) {
        return userProfileRepository.findFollowingOfUser(userId, pageable)
                .map(userProfileService::convertToDto);
    }

    /**
     * Get pending friend requests for current user
     * @param pageable pagination information
     * @return Page of user profile DTOs
     */
    public Page<UserProfile> getPendingFriendRequests(Pageable pageable) {
        UserProfile currentUser = getCurrentUserProfile();
        return userProfileRepository.findPendingFriendRequestsForUser(currentUser.getId(), pageable)
                .map(userProfileService::convertToDto);
    }
}