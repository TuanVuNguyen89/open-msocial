package com.devteria.post.service;

import com.devteria.post.dto.ApiResponse;
import com.devteria.post.dto.request.PostEventData;
import com.devteria.post.entity.Visibility;
import com.devteria.post.exception.AppException;
import com.devteria.post.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import com.devteria.post.dto.PageResponse;
import com.devteria.post.dto.request.PostEvent;
import com.devteria.post.dto.request.PostRequest;
import com.devteria.post.dto.response.PostResponse;
import com.devteria.post.dto.response.UserProfileResponse;
import com.devteria.post.entity.Post;
import com.devteria.post.mapper.PostMapper;
import com.devteria.post.repository.PostRepository;
import com.devteria.post.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {
    DateTimeFormatter dateTimeFormatter;
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;
    KafkaTemplate<String, PostEvent> kafkaTemplate;

    @NonFinal
    @Value("${spring.kafka.topics.post-created}")
    static final String postCreatedTopic = "POST_CREATED";

    @NonFinal
    @Value("${spring.kafka.topics.post-updated}")
    static final String postUpdatedTopic = "POST_UPDATED";

    @NonFinal
    @Value("${spring.kafka.topics.post-deleted}")
    static final String postDeletedTopic = "POST_DELETED";

    public PostResponse createPost(PostRequest request) {
        String userId = getCurrentUserId();
        UserProfileResponse userProfile = getUserProfileOrThrow(userId);

        Post post = Post.builder()
                .content(request.getContent())
                .userId(userProfile.getId())
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .visibility(request.getVisibility())
                .build();

        post = postRepository.save(post);
        sendPostEvent(post, "POST_CREATED", postCreatedTopic);

        return postMapper.toPostResponse(post);
    }

    public PageResponse<PostResponse> getMyPosts(int page, int size) {
        String userId = getCurrentUserId();
        UserProfileResponse userProfile = getUserProfileOrThrow(userId);

        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = createPageable(page, size, sort);

        Page<Post> pageData = postRepository.findAllByUserId(userProfile.getId(), pageable);

        String username = userProfile.getUsername();
        List<PostResponse> postList = mapPostsToResponses(pageData.getContent(), username);

        return buildPageResponse(pageData, postList, page);
    }

    public PageResponse<PostResponse> getUserPosts(String targetUserId, int page, int size) {
        String userId = getCurrentUserId();
        UserProfileResponse userProfile = getUserProfileOrThrow(userId);

        // Nếu đang xem bài viết của chính mình
        if (userProfile.getId().equals(targetUserId)) {
            return getMyPosts(page, size);
        }

        // Kiểm tra mối quan hệ bạn bè
        boolean areFriends = checkFriendship(userProfile.getId(), targetUserId);

        // Lấy dữ liệu theo quyền truy cập
        Page<Post> pageData = fetchPostsByVisibility(targetUserId, areFriends, page, size);

        // Lấy thông tin người dùng mục tiêu
        UserProfileResponse targetProfile = getUserProfileById(targetUserId);

        String username = targetProfile != null ? targetProfile.getUsername() : null;
        List<PostResponse> postList = mapPostsToResponses(pageData.getContent(), username);

        return buildPageResponse(pageData, postList, page);
    }

    public PostResponse getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        String userId = getCurrentUserId();
        UserProfileResponse userProfile = getUserProfileOrThrow(userId);

        // Kiểm tra quyền xem
        if (post.getVisibility() == Visibility.PRIVATE && !post.getUserId().equals(userProfile.getId())) {
            throw new AppException(ErrorCode.POST_NOT_FOUND);
        }

        if (post.getVisibility() == Visibility.FRIENDS && !post.getUserId().equals(userProfile.getId())) {
            // Kiểm tra mối quan hệ bạn bè
            boolean areFriends = checkFriendship(post.getUserId(), userProfile.getId());

            if (!areFriends) {
                throw new AppException(ErrorCode.POST_NOT_FOUND);
            }
        }

        UserProfileResponse postUser = getUserProfileById(post.getUserId());
        if (postUser == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        var username = postUser.getUsername();
        PostResponse postResponse = postMapper.toPostResponse(post);
        postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
        postResponse.setUsername(username);
        return postResponse;
    }

    public PostResponse updatePost(String postId, PostRequest request) {
        var userId = getCurrentUserId();
        var userProfile = getUserProfileOrThrow(userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        // Kiểm tra quyền sửa
        if (!post.getUserId().equals(userProfile.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        post.setContent(request.getContent());
        post.setVisibility(request.getVisibility());
        post.setModifiedDate(Instant.now());

        post = postRepository.save(post);

        // Gửi event
        PostEvent event = PostEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("POST_UPDATED")
                .timestamp(Instant.now())
                .data(PostEventData.builder()
                        .postId(post.getId())
                        .userId(post.getUserId())
                        .content(post.getContent())
                        .visibility(post.getVisibility())
                        .modifiedDate(post.getModifiedDate())
                        .build())
                .build();

        kafkaTemplate.send(postUpdatedTopic, event);

        var username = userProfile.getUsername();
        PostResponse postResponse = postMapper.toPostResponse(post);
        postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
        postResponse.setUsername(username);

        return postMapper.toPostResponse(post);
    }

    public boolean deletePost(String postId) {
        var userId = getCurrentUserId();
        var userProfile = getUserProfileOrThrow(userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        // Kiểm tra quyền xóa
        if (!post.getUserId().equals(userProfile.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        postRepository.delete(post);

        // Gửi event
        PostEvent event = PostEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("POST_DELETED")
                .timestamp(Instant.now())
                .data(PostEventData.builder()
                        .postId(post.getId())
                        .userId(post.getUserId())
                        .build())
                .build();

        kafkaTemplate.send(postDeletedTopic, event);

        return true;
    }

    public PageResponse<PostResponse> getFeed(int page, int size) {
        String userId = getCurrentUserId();
        var userProfile = getUserProfileOrThrow(userId);

        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // Lấy danh sách ID bạn bè
        List<String> friendIds = new ArrayList<>();
        try {
            ApiResponse<List<String>> response = profileClient.getFriendIds(userProfile.getId());
            if (response.getResult() != null) {
                friendIds = response.getResult();
            }
        } catch (Exception e) {
            log.error("Error getting friend IDs", e);
        }

        // Lấy bài viết công khai và bài viết của bạn bè
        Page<Post> pageData = postRepository.findAllByVisibilityOrUserIdInAndVisibility(
                Visibility.PUBLIC,
                friendIds,
                Visibility.FRIENDS,
                pageable);

        List<PostResponse> postList = pageData.getContent().stream()
                .map(postMapper::toPostResponse)
                .toList();

        var userNameMap = new HashMap<String, String>();
        postList.forEach(postResponse -> {
            postResponse.setCreated(dateTimeFormatter.format(postResponse.getCreatedDate()));
            if (userNameMap.containsKey(postResponse.getUserId())) {
                postResponse.setUsername(userNameMap.get(postResponse.getUserId()));
            }
            else {
                var targetProfile = getUserProfileById(postResponse.getUserId());
                userNameMap.put(postResponse.getUserId(), targetProfile == null ? "" : targetProfile.getUsername());
                postResponse.setUsername(targetProfile == null ? "" : targetProfile.getUsername());
            }
        });
        return buildPageResponse(pageData, postList, page);
    }

    // Phương thức hỗ trợ

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private UserProfileResponse getUserProfile(String userId) {
        try {
            return profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
            return null;
        }
    }

    private UserProfileResponse getUserProfileOrThrow(String userId) {
        UserProfileResponse userProfile = getUserProfile(userId);
        if (userProfile == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return userProfile;
    }

    private UserProfileResponse getUserProfileById(String userId) {
        try {
            return profileClient.getProfileById(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
            return null;
        }
    }

    private boolean checkFriendship(String userId, String targetUserId) {
        try {
            ApiResponse<Boolean> response = profileClient.areFriends(userId, targetUserId);
            return Boolean.TRUE.equals(response.getResult());
        } catch (Exception e) {
            log.error("Error checking friendship relationship", e);
            return false;
        }
    }

    private Page<Post> fetchPostsByVisibility(String targetUserId, boolean areFriends, int page, int size) {
        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = createPageable(page, size, sort);

        // Nếu là bạn bè, lấy bài viết PUBLIC và FRIENDS
        if (areFriends) {
            return postRepository.findAllByUserIdAndVisibilityOrUserIdAndVisibility(
                    targetUserId, Visibility.PUBLIC,
                    targetUserId, Visibility.FRIENDS,
                    pageable);
        } else {
            // Nếu không phải bạn bè, chỉ lấy bài viết PUBLIC
            return postRepository.findAllByUserIdAndVisibility(targetUserId, Visibility.PUBLIC, pageable);
        }
    }

    private Pageable createPageable(int page, int size, Sort sort) {
        return PageRequest.of(page - 1, size, sort);
    }

    private List<PostResponse> mapPostsToResponses(List<Post> posts, String username) {
        return posts.stream().map(post -> {
            PostResponse postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            postResponse.setUsername(username);
            return postResponse;
        }).toList();
    }

    private void sendPostEvent(Post post, String eventType, String topic) {
        PostEvent event = PostEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .timestamp(Instant.now())
                .data(PostEventData.builder()
                        .postId(post.getId())
                        .userId(post.getUserId())
                        .content(post.getContent())
                        .visibility(post.getVisibility())
                        .createdDate(post.getCreatedDate())
                        .build())
                .build();

        kafkaTemplate.send(topic, event);
    }

    private <T> PageResponse<T> buildPageResponse(Page<?> page, List<T> data, int currentPage) {
        return PageResponse.<T>builder()
                .currentPage(currentPage)
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .data(data)
                .build();
    }
}