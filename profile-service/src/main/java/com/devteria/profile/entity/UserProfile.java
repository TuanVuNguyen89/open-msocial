package com.devteria.profile.entity;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.neo4j.core.schema.*;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import lombok.*;
import lombok.experimental.FieldDefaults;

import static org.springframework.data.neo4j.core.schema.Relationship.Direction.INCOMING;
import static org.springframework.data.neo4j.core.schema.Relationship.Direction.OUTGOING;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Node("user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(generatorClass = UUIDStringGenerator.class)
    String id;

    @Property("userId")
    String userId;

    String username;
    String email;

    String firstName;
    String lastName;
    LocalDate dob;
    String city;

    @Relationship(type = "FRIEND_WITH", direction = OUTGOING)
    private Set<UserProfile> friends = new HashSet<>();

    @Relationship(type = "FRIEND_REQUEST", direction = OUTGOING)
    private Set<FriendRequestRelationship> sentFriendRequests = new HashSet<>();

    @Relationship(type = "FRIEND_REQUEST", direction = INCOMING)
    private Set<FriendRequestRelationship> receivedFriendRequests = new HashSet<>();
}
