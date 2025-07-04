package com.devteria.media_service.mapper;

import com.devteria.media_service.dto.response.MediaResponse;
import com.devteria.media_service.dto.response.MediaUploadResponse;
import com.devteria.media_service.entity.Media;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring") // Indicate that it's a Spring component
public interface MediaMapper {

    MediaMapper INSTANCE = Mappers.getMapper(MediaMapper.class);

    MediaUploadResponse mediaToMediaUploadResponse(Media media);

    MediaResponse mediaToMediaResponse(Media media);
}