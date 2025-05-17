package com.devteria.profile.dto.response;

import com.devteria.profile.entity.RelationshipType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRelationshipResponse {
    UserProfileResponse sender;
    UserProfileResponse receiver;
    RelationshipType relationshipType;
}
