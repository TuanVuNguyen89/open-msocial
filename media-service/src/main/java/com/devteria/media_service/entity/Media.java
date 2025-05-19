package com.devteria.media_service.entity;

import com.devteria.media_service.entity.MapToJsonConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "media")
@Data
public class Media {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "VARCHAR(255)")
    String id;

    @Column(nullable = false)
    String url;

    @Column(name = "public_id", nullable = false)
    String publicId;

    String type; // IMAGE, VIDEO, PDF, AUDIO, TEXT, DOCUMENT, etc.

    String format; // jpg, png, mp4, pdf, etc.

    Long size;
    Integer width;      // For images and videos
    Integer height;     // For images and videos
    Integer duration;   // For audio and video (in seconds)
    String originalFilename;

    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "post_id")
    String postId;
}