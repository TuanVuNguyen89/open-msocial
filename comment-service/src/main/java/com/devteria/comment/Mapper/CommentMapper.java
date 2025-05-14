package com.devteria.comment.Mapper;

import org.mapstruct.Mapper;

import com.devteria.comment.dto.response.CommentResponse;
import com.devteria.comment.entity.Comment;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentResponse toCommentResponse(Comment comment);
}
