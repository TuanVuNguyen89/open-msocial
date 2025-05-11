package com.devteria.comment.Mapper;

import com.devteria.comment.dto.response.CommentResponse;
import com.devteria.comment.entity.Comment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentResponse toCommentResponse(Comment comment);
}
