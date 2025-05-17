package com.devteria.profile.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.devteria.profile.dto.response.UserProfileResponse;
import com.devteria.profile.dto.response.UserRelationshipResponse;
import com.devteria.profile.entity.RelationshipType;
import com.devteria.profile.entity.UserRelationship;
import com.devteria.profile.exception.AppException;
import com.devteria.profile.exception.ErrorCode;
import com.devteria.profile.repository.UserRelationshipRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserRelationshipService {
    UserProfileService userProfileService;
    UserRelationshipRepository userRelationshipRepository;

    public UserRelationshipResponse sendFriendRequest(String receiverId) {
        var sender = userProfileService.getMyProfile();
        var receiver = userProfileService.getProfile(receiverId);

        var existedRelationship =
                userRelationshipRepository.findBySenderIdAndReceiverId(sender.getId(), receiver.getId());
        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            if (relationship.getRelationshipType() == RelationshipType.FRIEND
                    || relationship.getRelationshipType() == RelationshipType.SENT_FRIEND_REQUEST) {
                throw new AppException(ErrorCode.SENT_FRIEND_REQUEST);
            }
        }

        existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(receiver.getId(), sender.getId());
        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            if (relationship.getRelationshipType() == RelationshipType.SENT_FRIEND_REQUEST) {
                return acceptFriendRequest(receiver.getId());
            }
        }

        var relationship = UserRelationship.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .relationshipType(RelationshipType.SENT_FRIEND_REQUEST)
                .build();

        userRelationshipRepository.save(relationship);
        return UserRelationshipResponse.builder()
                .sender(sender)
                .receiver(receiver)
                .relationshipType(relationship.getRelationshipType())
                .build();
    }

    public UserRelationshipResponse acceptFriendRequest(String receiverId) {
        var sender = userProfileService.getMyProfile();
        var receiver = userProfileService.getProfile(receiverId);

        var existedRelationship =
                userRelationshipRepository.findBySenderIdAndReceiverId(sender.getId(), receiver.getId());
        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            if (relationship.getRelationshipType() == RelationshipType.FRIEND) {
                throw new AppException(ErrorCode.FRIEND_RELATIONSHIP);
            } else {
                throw new AppException(ErrorCode.SENT_FRIEND_REQUEST);
            }
        }

        existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(receiver.getId(), sender.getId());
        if (existedRelationship.isEmpty()) {
            throw new AppException(ErrorCode.NOT_SENT_FRIEND_REQUEST);
        }

        var relationship = existedRelationship.get();
        if (relationship.getRelationshipType() == RelationshipType.FRIEND) {
            throw new AppException(ErrorCode.FRIEND_RELATIONSHIP);
        }

        relationship.setRelationshipType(RelationshipType.FRIEND);
        userRelationshipRepository.save(relationship);
        return UserRelationshipResponse.builder()
                .sender(sender)
                .receiver(receiver)
                .relationshipType(relationship.getRelationshipType())
                .build();
    }

    public Boolean rejectFriendRequest(String senderId) {
        var sender = userProfileService.getProfile(senderId);
        var receiver = userProfileService.getMyProfile();

        var existedRelationship =
                userRelationshipRepository.findBySenderIdAndReceiverId(sender.getId(), receiver.getId());

        if (existedRelationship.isEmpty()) {
            throw new AppException(ErrorCode.NOT_SENT_FRIEND_REQUEST);
        }

        var relationship = existedRelationship.get();
        if (relationship.getRelationshipType() == RelationshipType.FRIEND) {
            throw new AppException(ErrorCode.FRIEND_RELATIONSHIP);
        }

        userRelationshipRepository.delete(relationship);
        return true;
    }

    public boolean removeFriend(String receiverId) {
        var me = userProfileService.getMyProfile();
        var other = userProfileService.getProfile(receiverId);

        var existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(me.getId(), other.getId());

        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            if (relationship.getRelationshipType() == RelationshipType.SENT_FRIEND_REQUEST) {
                throw new AppException(ErrorCode.NOT_BE_FRIEND);
            }

            userRelationshipRepository.delete(relationship);
        }

        existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(other.getId(), me.getId());

        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            if (relationship.getRelationshipType() == RelationshipType.SENT_FRIEND_REQUEST) {
                throw new AppException(ErrorCode.NOT_BE_FRIEND);
            }

            userRelationshipRepository.delete(relationship);
        }

        return false;
    }

    public boolean areFriends(String userId1, String userId2) {
        var user1 = userProfileService.getProfile(userId1);
        var user2 = userProfileService.getProfile(userId2);

        var existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(user1.getId(), user2.getId());
        if (existedRelationship.isPresent()) {
            var relationship = existedRelationship.get();
            return relationship.getRelationshipType() != RelationshipType.SENT_FRIEND_REQUEST;
        }

        existedRelationship = userRelationshipRepository.findBySenderIdAndReceiverId(user2.getId(), user1.getId());
        if (existedRelationship.isEmpty()) return false;

        var relationship = existedRelationship.get();
        return relationship.getRelationshipType() != RelationshipType.SENT_FRIEND_REQUEST;
    }

    public Page<UserProfileResponse> getUserFriends(String userId, Pageable pageable) {
        var relationships = userRelationshipRepository.findFriendsByUserId(userId, RelationshipType.FRIEND, pageable);
        var friendIds = relationships.map(r -> r.getSenderId().equals(userId) ? r.getReceiverId() : r.getSenderId());

        var profiles = friendIds
                .map(userProfileService::getProfile) // Chuyển userId sang UserProfile
                .toList();

        return new PageImpl<>(profiles, pageable, relationships.getTotalElements());
    }

    public Page<UserProfileResponse> getPendingFriendRequests(Pageable pageable) {
        var me = userProfileService.getMyProfile();
        var requests = userRelationshipRepository.findPendingRequestsForUser(
                me.getId(), RelationshipType.SENT_FRIEND_REQUEST, pageable);

        var senders = requests.map(r -> userProfileService.getProfile(r.getSenderId()))
                .toList();

        return new PageImpl<>(senders, pageable, requests.getTotalElements());
    }

    public Page<UserProfileResponse> getMyUserFriends(Pageable pageable) {
        var me = userProfileService.getMyProfile();
        return getUserFriends(me.getId(), pageable);
    }
}
