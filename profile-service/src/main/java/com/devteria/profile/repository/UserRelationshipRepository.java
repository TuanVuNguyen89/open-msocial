package com.devteria.profile.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.profile.entity.RelationshipType;
import com.devteria.profile.entity.UserProfile;
import com.devteria.profile.entity.UserRelationship;

@Repository
public interface UserRelationshipRepository extends JpaRepository<UserRelationship, String> {

    Optional<UserRelationship> findBySenderIdAndReceiverId(String senderId, String receiverId);

    @Query(
            """
		SELECT r FROM UserRelationship r
		WHERE (r.senderId = :userId OR r.receiverId = :userId)
		AND r.relationshipType = :relationshipType
		""")
    Page<UserRelationship> findFriendsByUserId(
            @Param("userId") String userId,
            @Param("relationshipType") RelationshipType relationshipType,
            Pageable pageable);

    @Query(
            """
		SELECT r FROM UserRelationship r
		WHERE (r.senderId = :userId OR r.receiverId = :userId)
		AND r.relationshipType = :relationshipType
		""")
    List<UserRelationship> findFriendsByUserId(
            @Param("userId") String userId, @Param("relationshipType") RelationshipType relationshipType);

    @Query(
            """
		SELECT r FROM UserRelationship r
		WHERE r.receiverId = :receiverId
		AND r.relationshipType = :relationshipType
		""")
    Page<UserRelationship> findPendingRequestsForUser(
            @Param("receiverId") String receiverId,
            @Param("relationshipType") RelationshipType relationshipType,
            Pageable pageable);

    @Query(
            """
	SELECT DISTINCT up FROM UserProfile up
	WHERE up.id != :currentUserId
	AND up.id NOT IN (
		SELECT CASE
			WHEN ur.senderId = :currentUserId THEN ur.receiverId
			ELSE ur.senderId
		END
		FROM UserRelationship ur
		WHERE (ur.senderId = :currentUserId OR ur.receiverId = :currentUserId)
	)
	ORDER BY up.createdDate DESC
	""")
    Page<UserProfile> findUsersNotConnected(@Param("currentUserId") String currentUserId, Pageable pageable);
}
