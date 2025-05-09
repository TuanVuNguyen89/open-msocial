package com.devteria.profile.repository;

import com.devteria.profile.entity.FriendRequestRelationship;
import com.devteria.profile.entity.UserProfile;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository để quản lý các relationship FRIEND_REQUEST
 */
@Repository
public interface FriendRequestRepository extends Neo4jRepository<UserProfile, String> {

    /**
     * Check if a friend request exists between two users
     */
    @Query("MATCH (a:UserProfile)-[r:FRIEND_REQUEST]->(b:UserProfile) " +
            "WHERE a.id = $senderId AND b.id = $receiverId " +
            "RETURN COUNT(r) > 0")
    boolean existsBySenderIdAndReceiverId(@Param("senderId") String senderId, @Param("receiverId") String receiverId);

    /**
     * Find friend request by sender and receiver
     */
    @Query("MATCH (a:UserProfile)-[r:FRIEND_REQUEST]->(b:UserProfile) " +
            "WHERE a.id = $senderId AND b.id = $receiverId " +
            "RETURN r")
    Optional<FriendRequestRelationship> findBySenderIdAndReceiverId(@Param("senderId") String senderId, @Param("receiverId") String receiverId);

    /**
     * Delete a friend request
     */
    @Query("MATCH (sender:UserProfile)-[r:FRIEND_REQUEST]->(receiver:UserProfile) " +
            "WHERE sender.id = $senderId AND receiver.id = $receiverId " +
            "DELETE r")
    void deleteFriendRequest(@Param("senderId") String senderId, @Param("receiverId") String receiverId);

    /**
     * Count pending friend requests for a user
     */
    @Query("MATCH (sender:UserProfile)-[r:FRIEND_REQUEST]->(receiver:UserProfile) " +
            "WHERE receiver.id = $userId AND r.status = 'PENDING' " +
            "RETURN COUNT(r)")
    long countPendingFriendRequests(@Param("userId") String userId);
}