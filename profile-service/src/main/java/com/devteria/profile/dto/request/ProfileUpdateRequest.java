package com.devteria.profile.dto.request;

import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    String firstName;
    String lastName;
    LocalDate dob;
    String city;

    String avatarUrl;
    String backgroundUrl;
}
