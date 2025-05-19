package com.devteria.post.repository;

import com.devteria.post.entity.Post;
import com.devteria.post.entity.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findAllByUserId(String userId, Pageable pageable);

    // Tìm bài viết công khai của người dùng
    Page<Post> findAllByUserIdAndVisibility(String userId, Visibility visibility, Pageable pageable);

    // Tìm bài viết công khai
    Page<Post> findAllByVisibility(Visibility visibility, Pageable pageable);

    // Tìm bài viết với nhiều điều kiện (cho người dùng và bạn bè)
    Page<Post> findAllByUserIdAndVisibilityOrUserIdAndVisibility(
            String userId1, Visibility visibility1,
            String userId2, Visibility visibility2,
            Pageable pageable);

    // Tìm bài viết công khai + của bạn bè
    Page<Post> findAllByVisibilityOrUserIdInAndVisibility(
            Visibility publicVisibility,
            List<String> friendIds,
            Visibility friendsVisibility,
            Pageable pageable
    );

    @Query(value = """
    {
      "$or": [
        { "visibility": "PUBLIC" },
        { "userId": { "$in": ?1 }, "visibility": "FRIENDS" },
        { "userId": ?0, "visibility": { "$in": ["FRIENDS", "PRIVATE"] } }
      ]
    }
    """)
    Page<Post> findFeedPosts(String userId, List<String> friendIds, Pageable pageable);


}
