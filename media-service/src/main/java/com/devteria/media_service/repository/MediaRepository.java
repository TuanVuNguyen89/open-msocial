package com.devteria.media_service.repository;

import com.devteria.media_service.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MediaRepository extends JpaRepository<Media, String> {
    Optional<Media> findByUrl(String url);
    Optional<Media> findById(String id);
}