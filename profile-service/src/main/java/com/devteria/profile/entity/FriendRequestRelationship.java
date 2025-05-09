package com.devteria.profile.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RelationshipProperties
public class FriendRequestRelationship {
    @RelationshipId
    String id;

    private String status; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TargetNode
    private UserProfile receiver;

    public FriendRequestRelationship(UserProfile receiver) {
        this.receiver = receiver;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }
}
