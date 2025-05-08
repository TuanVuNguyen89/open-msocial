package com.devteria.profile.repository;

import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.profile.entity.UserProfile;

@Repository
public interface UserProfileRepository extends Neo4jRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);
    Optional<UserProfile> findByUsername(String username);

    Optional<UserProfile> findByEmail(String email);
    /**
     * Check if two users are friends
     */
    @Query("MATCH (a:UserProfile {id: $user1Id})-[r:FRIENDS_WITH]-(b:UserProfile {id: $user2Id}) " +
            "RETURN COUNT(r) > 0")
    boolean areFriends(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);

    /**
     * Create friendship between two users
     */
    @Query("MATCH (a:UserProfile {id: $user1Id}), (b:UserProfile {id: $user2Id}) " +
            "MERGE (a)-[:FRIENDS_WITH]->(b) " +
            "MERGE (b)-[:FRIENDS_WITH]->(a)")
    void createFriendship(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);
}
