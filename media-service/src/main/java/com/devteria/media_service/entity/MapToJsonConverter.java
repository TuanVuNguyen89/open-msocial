package com.devteria.media_service.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class MapToJsonConverter implements AttributeConverter<Map<String, Object>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null) {
            return null; // Or handle empty map as needed
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            // Log the error! Don't just swallow it.  Wrap in a RuntimeException
            throw new RuntimeException("Error converting Map to JSON: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return new HashMap<>(); // Or return null, depending on your needs
        }
        try {
            // Important: Specify the typeReference to handle generic type correctly
            return objectMapper.readValue(dbData, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            // Log the error!  Wrap in a RuntimeException
            throw new RuntimeException("Error converting JSON to Map: " + e.getMessage(), e);
        }
    }
}