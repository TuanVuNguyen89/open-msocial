package com.devteria.post.dto.response;

import com.devteria.post.entity.RelationshipType;
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