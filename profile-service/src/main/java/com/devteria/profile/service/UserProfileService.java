package com.devteria.profile.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.devteria.profile.dto.request.ProfileCreationRequest;
import com.devteria.profile.dto.request.ProfileUpdateRequest;
import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.exception.AppException;
import com.devteria.profile.exception.ErrorCode;
import com.devteria.profile.mapper.UserProfileMapper;
import com.devteria.profile.repository.FollowRelationshipRepository;
import com.devteria.profile.repository.UserProfileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;
    FollowRelationshipRepository followRelationshipRepository;

    /**
     * Create a new user profile
     */
    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    /**
     * Get user profile by user ID (from auth system)
     */
    public UserProfileResponse getByUserId(String userId) {
        UserProfile userProfile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    /**
     * Get user profile by profile ID
     */
    public UserProfileResponse getProfile(String id) {
        UserProfile userProfile =
                userProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    /**
     * Get all user profiles (admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfiles() {
        var profiles = userProfileRepository.findAll();

        return profiles.stream().map(userProfileMapper::toUserProfileReponse).toList();
    }

    /**
     * Get current user's profile
     */
    public UserProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileReponse(profile);
    }

    public UserProfileResponse updateProfile(String id, ProfileUpdateRequest request) {
        UserProfile userProfile =
                userProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Verify current user is owner of this profile or admin
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));

        if (!userProfile.getUserId().equals(currentUserId) && !isAdmin) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Update profile fields
        if (request.getFirstName() != null) {
            userProfile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            userProfile.setLastName(request.getLastName());
        }
        if (request.getDob() != null) {
            userProfile.setDob(request.getDob());
        }
        if (request.getCity() != null) {
            userProfile.setCity(request.getCity());
        }

        userProfile = userProfileRepository.save(userProfile);
        return userProfileMapper.toUserProfileReponse(userProfile);
    }

    /**
     * Follow another user
     * @param targetUserId ID of user to follow
     * @return true if successful
     */
    public boolean followUser(String targetUserId) {
        UserProfile currentUser = getUserProfileByUserId(getCurrentUserId());
        UserProfile targetUser = getUserProfileById(targetUserId);

        // Don't allow following yourself
        if (currentUser.getId().equals(targetUserId)) {
            return false;
        }

        // Check if already following
        if (followRelationshipRepository.checkFollowRelationship(currentUser.getId(), targetUserId)) {
            return true; // Already following, consider it success
        }

        // Create FOLLOWS relationship using Cypher query
        return followRelationshipRepository.createFollowRelationship(currentUser.getId(), targetUserId);
    }

    /**
     * Unfollow a user
     * @param targetUserId ID of user to unfollow
     * @return true if successful
     */
    public boolean unfollowUser(String targetUserId) {
        UserProfile currentUser = getUserProfileByUserId(getCurrentUserId());
        UserProfile targetUser = getUserProfileById(targetUserId);

        // Don't allow unfollowing yourself
        if (currentUser.getId().equals(targetUserId)) {
            return false;
        }

        // Check if actually following
        if (!followRelationshipRepository.checkFollowRelationship(currentUser.getId(), targetUserId)) {
            return false; // Not following, consider it success
        }

        // Delete FOLLOWS relationship using Cypher query
        return followRelationshipRepository.removeFollowRelationship(currentUser.getId(), targetUserId);
    }

    /**
     * Get user profile by ID
     * @param id User profile ID
     * @return User profile
     */
    public UserProfile getUserProfileById(String id) {
        return userProfileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    /**
     * Get user profile by userId (from Auth)
     * @param userId User ID from Auth system
     * @return User profile
     */
    public UserProfile getUserProfileByUserId(String userId) {
        return userProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
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
     * Convert User Profile entity to DTO
     * @param userProfile User profile entity
     * @return User profile DTO
     */
    public UserProfile convertToDto(UserProfile userProfile) {
        return UserProfile.builder()
                .id(userProfile.getId())
                .userId(userProfile.getUserId())
                .username(userProfile.getUsername())
                .email(userProfile.getEmail())
                .firstName(userProfile.getFirstName())
                .lastName(userProfile.getLastName())
                .dob(userProfile.getDob())
                .city(userProfile.getCity())
                .build();
    }
}
