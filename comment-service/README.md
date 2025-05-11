# 📘 Comment Service - Open MSocial

Module `Comment` chịu trách nhiệm quản lý các bình luận của người dùng trong hệ thống mạng xã hội. Hệ thống hỗ trợ bình luận nhiều cấp (reply), sử dụng cấu trúc **flat list** kết hợp với `rootId` và `pUserId` để xử lý cây bình luận hiệu quả và tránh lỗi đệ quy sâu khi trả JSON.

---

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