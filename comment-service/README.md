# 📘# 💬 Open MSocial - Comment Service

## 📌 Overview

The **Comment Service** is responsible for managing comments on posts in the Open MSocial platform. It handles the creation, retrieval, updating, and deletion of comments, as well as nested comment threads.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementing REST APIs
- **MongoDB**: NoSQL database for storing comment data
- **Spring Data MongoDB**: For database interaction
- **Spring Security**: For authentication and authorization
- **Kafka**: For event-driven communication with other services

## 🧩 Data Model

### `Comment`
| Field         | Data Type    | Description                     |
|---------------|--------------|----------------------------------|
| `id`          | string       | Primary key                     |
| `postId`      | string       | ID of the associated post       |
| `userId`      | string       | ID of the comment creator       |
| `content`     | string       | Textual content of the comment  |
| `parentId`    | string       | ID of parent comment (if reply) |
| `createdAt`   | Date         | Comment creation timestamp      |
| `updatedAt`   | Date         | Last update timestamp           |
| `likeCount`   | int          | Number of likes                 |

## 📡 API Endpoints

### Comment Management
- **POST** `/comment/comments` - Create a new comment
- **GET** `/comment/comments/{commentId}` - Get comment by ID
- **PUT** `/comment/comments/{commentId}` - Update comment
- **DELETE** `/comment/comments/{commentId}` - Delete comment

### Comment Queries
- **GET** `/comment/posts/{postId}/comments` - Get comments for a post
- **GET** `/comment/comments/{commentId}/replies` - Get replies to a comment
- **GET** `/comment/users/{userId}/comments` - Get comments by user

### Comment Interactions
- **POST** `/comment/comments/{commentId}/like` - Like a comment
- **DELETE** `/comment/comments/{commentId}/like` - Unlike a comment

## 🚀 How to Run

### Prerequisites
- Java 21
- Maven
- MongoDB
- Kafka (optional, for event processing)

### Local Development
1. Ensure MongoDB is running and accessible with credentials in `application.yaml`
2. Run the service:
```bash
mvn spring-boot:run
```

### Using Docker
1. Build the Docker image:
```bash
docker build -t comment-service .
```

2. Run the container:
```bash
docker run -p 8084:8084 \
  -e SPRING_DATA_MONGODB_URI=mongodb://root:root@host.docker.internal:27017/comment-service?authSource=admin \
  -e APP_SERVICES_PROFILE_URL=http://host.docker.internal:8081/profile \
  comment-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up comment-service
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

- **Identity Service**: User authentication and authorization
- **Profile Service**: User information for comments
- **Post Service**: Posts that comments are associated with
- **Notification Service**: Notifications for comment activities

## ✅ Mô hình dữ liệu

### `Comment` (MongoDB Document)

```java
public class Comment {
    @MongoId
    private String id;              // ID duy nhất của comment
    private String postId;          // ID bài viết liên quan
    private String userId;          // Người tạo comment
    private String content;         // Nội dung
    private Instant createdAt;      // Thời điểm tạo
    private Instant updatedAt;      // Thời điểm cập nhật
    private String rootId;          // ID của comment tổ tiên cao nhất trong chuỗi reply
    private String pUserId;         // ID của người dùng của comment cha trực tiếp
}
```

### `CommentResponse`

```java
public class CommentResponse {
    private String id;
    private String content;
    private UserProfileResponse user;   // Người tạo comment
    private UserProfileResponse pUser;  // Người được reply (nếu có)
    private String rootId;
}
```

## 📌 Các Service chính

### 1. CommentService

**Mục tiêu**: Xử lý nghiệp vụ liên quan đến comment: tạo, cập nhật, xóa, truy vấn comment.

**Interface**

```java
public interface CommentService {
    CommentResponse createComment(CreateCommentRequest request, String currentUserId);
    CommentResponse updateComment(String id, UpdateCommentRequest request, String currentUserId);
    void deleteComment(String id, String currentUserId);
    List<CommentResponse> getCommentsByPostId(String postId);
    List<CommentResponse> getRepliesByRootId(String rootId);
}
```

**Logic chính**:

- **createComment()**:
    - Nếu là bình luận mới → rootId = id, pUserId = null
    - Nếu là reply → tìm comment cha, lấy rootId = cha.rootId, pUserId = cha.userId

- **getCommentsByPostId()**:
    - Trả về danh sách comment gốc (rootId == id) theo postId
    - Trả về dạng flat list hoặc phân trang

- **getRepliesByRootId()**:
    - Trả về tất cả reply có cùng rootId
    - Client sẽ dựng lại cây reply từ flat list (theo id và parentId)

Có thể dùng WebClient hoặc OpenFeign để gọi User Service.

## 📎 API gợi ý

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /comments | Tạo mới comment hoặc reply |
| GET | /comments/post/{postId} | Lấy danh sách comment của bài viết |
| GET | /comments/root/{rootId} | Lấy toàn bộ replies cùng root |
| PUT | /comments/{id} | Cập nhật comment |
| DELETE | /comments/{id} | Xoá comment (nếu là chủ comment) |