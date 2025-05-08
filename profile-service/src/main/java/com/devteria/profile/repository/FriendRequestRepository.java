package com.devteria.profile.repository;

import com.devteria.profile.entity.FriendRequest;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends Neo4jRepository<FriendRequest, String> {

    /**
     * Check if a friend request exists between two users
     */
    boolean existsBySenderIdAndReceiverId(String senderId, String receiverId);

    /**
     * Find friend request by sender and receiver
     */
    Optional<FriendRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);

    /**
     * Find all pending friend requests for a user
     */
    List<FriendRequest> findByReceiverIdAndStatus(String receiverId, String status);

    /**
     * Find all sent friend requests by a user
     */
    List<FriendRequest> findBySenderIdAndStatus(String senderId, String status);
}
