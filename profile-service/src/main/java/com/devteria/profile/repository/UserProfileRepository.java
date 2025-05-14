package com.devteria.profile.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.profile.entity.UserProfile;

@Repository
public interface UserProfileRepository extends Neo4jRepository<UserProfile, String> {

    Optional<UserProfile> findByUserId(String userId);

    Optional<UserProfile> findById(String Id);

    /**
     * Find if two users are friends
     * @param userId1 first user ID
     * @param userId2 second user ID
     * @return true if users are friends
     */
    @Query(
            "MATCH (u1:user_profile {id: $userId1})-[:FRIEND_WITH]->(u2:user_profile {id: $userId2}) RETURN COUNT(u2) > 0")
    boolean areFriends(@Param("userId1") String userId1, @Param("userId2") String userId2);

    /**
     * Find all friends of a user
     * @param userId user ID
     * @param pageable pagination info
     * @return page of user profiles
     */
    @Query(
            value = "MATCH (u:user_profile {id: $userId})-[:FRIEND_WITH]-(friend:user_profile) "
                    + "RETURN DISTINCT friend SKIP $skip LIMIT $limit",
            countQuery =
                    "MATCH (u:user_profile {id: $userId})-[:FRIEND_WITH]-(friend:user_profile) RETURN count(DISTINCT friend)")
    Page<UserProfile> findFriendsOfUser(@Param("userId") String userId, Pageable pageable);

    /**
     * Find all friends of a user
     * @param userId user ID
     * @return list of user profiles
     */
    @Query("MATCH (u:user_profile {id: $userId})-[:FRIEND_WITH]-(friend:user_profile) " + "RETURN DISTINCT friend")
    ArrayList<UserProfile> findFriendsOfUser(@Param("userId") String userId);

    /**
     * Find all followers of a user
     * @param userId user ID
     * @param pageable pagination info
     * @return page of user profiles
     */
    @Query(
            value = "MATCH (follower:user_profile)-[:FOLLOWS]->(u:user_profile {id: $userId}) "
                    + "RETURN follower SKIP $skip LIMIT $limit",
            countQuery =
                    "MATCH (follower:user_profile)-[:FOLLOWS]->(u:user_profile {id: $userId}) RETURN count(follower)")
    Page<UserProfile> findFollowersOfUser(@Param("userId") String userId, Pageable pageable);

    /**
     * Find all users followed by a user
     * @param userId user ID
     * @param pageable pagination info
     * @return page of user profiles
     */
    @Query(
            value = "MATCH (u:user_profile {id: $userId})-[:FOLLOWS]->(following:user_profile) "
                    + "RETURN following SKIP $skip LIMIT $limit",
            countQuery =
                    "MATCH (u:user_profile {id: $userId})-[:FOLLOWS]->(following:user_profile) RETURN count(following)")
    Page<UserProfile> findFollowingOfUser(@Param("userId") String userId, Pageable pageable);

    /**
     * Find all pending friend requests for a user
     * @param userId user ID
     * @param pageable pagination info
     * @return page of user profiles
     */
    @Query(
            value =
                    "MATCH (sender:user_profile)-[r:FRIEND_REQUEST]->(receiver:user_profile {id: $userId}) WHERE r.status = 'PENDING' "
                            + "RETURN sender SKIP $skip LIMIT $limit",
            countQuery =
                    "MATCH (sender:user_profile)-[r:FRIEND_REQUEST]->(receiver:user_profile {id: $userId}) WHERE r.status = 'PENDING' RETURN count(sender)")
    Page<UserProfile> findPendingFriendRequestsForUser(@Param("userId") String userId, Pageable pageable);

    /**
     * Find mutual friends between two users
     * @param userId1 first user ID
     * @param userId2 second user ID
     * @param pageable pagination info
     * @return page of user profiles
     */
    @Query(
            value =
                    "MATCH (u1:user_profile {id: $userId1})-[:FRIEND_WITH]-(mutual:user_profile)-[:FRIEND_WITH]-(u2:user_profile {id: $userId2}) "
                            + "RETURN DISTINCT mutual SKIP $skip LIMIT $limit",
            countQuery =
                    "MATCH (u1:user_profile {id: $userId1})-[:FRIEND_WITH]-(mutual:user_profile)-[:FRIEND_WITH]-(u2:user_profile {id: $userId2}) RETURN count(DISTINCT mutual)")
    Page<UserProfile> findMutualFriends(
            @Param("userId1") String userId1, @Param("userId2") String userId2, Pageable pageable);

    @Query(
            """
		MATCH (user:user_profile {id: $userId})-[:FRIEND_WITH]-(friend:user_profile)-[:FRIEND_WITH]-(suggestion:user_profile)
		WHERE NOT (user)-[:FRIEND_WITH]-(suggestion) AND suggestion.id <> $userId
		WITH suggestion, COUNT(DISTINCT friend) AS mutualCount
		RETURN suggestion
		ORDER BY mutualCount DESC
		LIMIT $limit
	""")
    List<UserProfile> findFriendSuggestions(@Param("userId") String userId, @Param("limit") int limit);
}
