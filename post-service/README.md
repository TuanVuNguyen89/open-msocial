# 📘 Post Module

## 🎯 Mục tiêu

Module **Post** chịu trách nhiệm cho phép người dùng đăng tải bài viết trên nền tảng mạng xã hội. Mỗi bài viết có thể chứa:
- Nội dung văn bản (`content`)
- Thời điểm tạo và sửa (`createdDate`, `modifiedDate`)
- Mức độ riêng tư (`visibility`)
- ID người đăng (`userId`)
- ID bài viết (`id` - UUID do MongoDB sinh hoặc client sinh)

Bài viết có thể được liên kết với các tài nguyên từ **Media Service** (ví dụ: ảnh, video) thông qua danh sách `mediaUrls` lưu bên ngoài hoặc trong phần `content`.

---

## 🧱 Entity Design

```java
Post {
    String id;                  // ID bài viết
    String userId;              // ID người đăng (từ Auth/User service)
    String content;             // Nội dung bài viết (có thể chứa text + markdown + link media)
    Instant createdDate;        // Thời điểm tạo
    Instant modifiedDate;       // Thời điểm sửa
    Visibility visibility;      // Quyền hiển thị
}
```

# Post Service API Specifications

## Data Model

### Enum: Visibility

```java
enum Visibility {
    PUBLIC,  // Ai cũng xem được
    FRIENDS, // Chỉ bạn bè xem được
    PRIVATE  // Chỉ người đăng xem được
}
```

## API Nghiệp vụ chính

### 1. Tạo bài viết
* **Endpoint:** `POST /api/posts`
* **Request Body:**
```json
{
    "content": "Hôm nay trời đẹp quá 😎",
    "visibility": "FRIENDS"
}
```
* **Response:** Trả về thông tin bài viết đã tạo

### 2. Lấy danh sách bài viết của người dùng
* **Endpoint:** `GET /api/posts/user/{userId}`
* **Query Params:** `page`, `size`, `sort`
* **Use case:** Trang cá nhân

### 3. Lấy chi tiết bài viết
* **Endpoint:** `GET /api/posts/{postId}`
* **Response:** Trả về bài viết nếu người xem có quyền

### 4. Cập nhật bài viết
* **Endpoint:** `PUT /api/posts/{postId}`
* **Authorization:** Người dùng là chủ bài viết
* **Request Body:**
```json
{
    "content": "Cập nhật nội dung mới!",
    "visibility": "PRIVATE"
}
```

### 5. Xoá bài viết
* **Endpoint:** `DELETE /api/posts/{postId}`
* **Logic:** Soft delete (nếu cần), hoặc xoá hẳn

## Chính sách quyền truy cập (Authorization)
* Người đăng bài có toàn quyền sửa, xoá bài viết.
* Người xem phải thỏa điều kiện:
    * `visibility == PUBLIC` → ai cũng xem được
    * `visibility == FRIENDS` → phải là bạn bè (gọi User service kiểm tra)
    * `visibility == PRIVATE` → chỉ người đăng
