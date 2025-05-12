package com.devteria.media_service.entity;

import com.devteria.media_service.entity.MapToJsonConverter;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.Date;
import java.util.Map;

@Entity
@Table(name = "media")
@Data
public class Media {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", columnDefinition = "VARCHAR(255)")
    private String id;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(nullable = false)
    private String type; // IMAGE, VIDEO

    @Column(nullable = false)
    private String format;

    @Column(nullable = false)
    private Long size;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "metadata", columnDefinition = "TEXT") // For storing JSON
    @Convert(converter = MapToJsonConverter.class) // Use the converter
    private Map<String, Object> metadata;

    @Column(name = "owner_type", nullable = false)
    private String ownerType; // POST, AVATAR

    @Column(name = "owner_id", nullable = false)
    private String ownerId;
}