package com.devteria.profile.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class UserRelationship {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String senderId;
    String receiverId;

    @Enumerated(EnumType.STRING)
    RelationshipType relationshipType; // FRIEND, SENT_FRIEND_REQUEST
}
