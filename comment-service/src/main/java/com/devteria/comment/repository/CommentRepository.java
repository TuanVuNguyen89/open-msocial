package com.devteria.comment.repository;

import com.devteria.comment.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    void deleteByPostId(String postId);

    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
    Page<Comment> findByRootIdOrderByCreatedAtAsc(String rootId, Pageable pageable);
    Page<Comment> findByPostIdAndRootIdIsNullOrderByCreatedAtDesc(String postId, Pageable pageable);
}
