package com.devteria.profile.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String userId;
    String username;
    String email;

    String firstName;
    String lastName;
    LocalDate dob;
    String city;

    String avatarUrl;
    String backgroundUrl;
}
