package com.devteria.profile.repository;

import com.devteria.profile.entity.UserProfile;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRelationshipRepository extends Neo4jRepository<UserProfile, String> {
    /**
     * Create a follow relationship between two users
     * @param followerId ID of the follower
     * @param targetId ID of the user being followed
     * @return true if successful
     */
    @Query("MATCH (a:user_profile {id: $followerId}), (b:user_profile {id: $targetId}) " +
            "MERGE (a)-[:FOLLOWS]->(b) " +
            "RETURN true")
    boolean createFollowRelationship(@Param("followerId") String followerId, @Param("targetId") String targetId);

    /**
     * Remove a follow relationship
     * @param followerId ID of the follower
     * @param targetId ID of the user being followed
     * @return true if relationship existed and was deleted
     */
    @Query("MATCH (a:user_profile {id: $followerId})-[r:FOLLOWS]->(b:user_profile {id: $targetId}) " +
            "DELETE r " +
            "RETURN true")
    boolean removeFollowRelationship(@Param("followerId") String followerId, @Param("targetId") String targetId);

    /**
     * Check if a user follows another user
     * @param followerId ID of the follower
     * @param targetId ID of the user being followed
     * @return true if follower follows target
     */
    @Query("MATCH (a:user_profile {id: $followerId})-[:FOLLOWS]->(b:user_profile {id: $targetId}) " +
            "RETURN COUNT(b) > 0")
    boolean checkFollowRelationship(@Param("followerId") String followerId, @Param("targetId") String targetId);
}
