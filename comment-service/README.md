# 💬 Open MSocial - Comment Feature

## 📌 Tổng quan

**Tính năng Comment** cho phép người dùng tương tác với các bài đăng trong nền tảng Open MSocial. Hệ thống hỗ trợ tạo, xem, chỉnh sửa và xóa comment, cũng như hiển thị các comment theo cấu trúc phân cấp.

## ⚙️ Công nghệ sử dụng

- **React**: Thư viện JavaScript để xây dựng giao diện người dùng
- **Material UI**: Framework UI cho các component
- **React Router**: Quản lý điều hướng trong ứng dụng
- **Axios**: Thực hiện các yêu cầu HTTP đến API

## 🧩 Mô hình dữ liệu

### `Comment`
| Trường        | Kiểu dữ liệu | Mô tả                           |
|---------------|--------------|----------------------------------|
| `id`          | string       | Khóa chính                      |
| `postId`      | string       | ID của bài đăng liên quan       |
| `content`     | string       | Nội dung văn bản của comment    |
| `parentId`    | string       | ID của comment cha (nếu là reply) |
| `createdAt`   | Date         | Thời gian tạo comment           |
| `updatedAt`   | Date         | Thời gian cập nhật gần nhất     |
| `user`        | object       | Thông tin người tạo comment     |
| `pUser`       | object       | Thông tin người được trả lời (nếu là reply) |

## 🧩 Cấu trúc Component

### 1. CommentSection
Component chính quản lý toàn bộ phần comment của một bài đăng, bao gồm:
- Hiển thị danh sách comment
- Phân trang để tải thêm comment
- Quản lý form tạo comment mới

### 2. CommentItem
Hiển thị một comment đơn lẻ với:
- Avatar và tên người dùng
- Nội dung comment với hỗ trợ tag @username
- Thời gian tạo/cập nhật
- Các nút tương tác (trả lời, chỉnh sửa, xóa)
- Hiển thị các comment con (replies) theo cấu trúc cây

### 3. CommentForm
Form để tạo hoặc chỉnh sửa comment:
- Nhập nội dung comment
- Hỗ trợ tag @username
- Xử lý gửi/cập nhật comment

## 📡 API Endpoints

### Quản lý Comment
- **POST** `/api/comments` - Tạo comment mới
- **GET** `/api/comments/{commentId}` - Lấy comment theo ID
- **PUT** `/api/comments/{commentId}` - Cập nhật comment
- **DELETE** `/api/comments/{commentId}` - Xóa comment

### Truy vấn Comment
- **GET** `/api/posts/{postId}/comments` - Lấy comment cho bài đăng
- **GET** `/api/comments/{commentId}/replies` - Lấy các reply cho comment
- **GET** `/api/users/{userId}/comments` - Lấy comment theo người dùng

## 🚀 Tính năng chính

1. **Tạo comment mới** trên bài đăng
2. **Trả lời comment** với hỗ trợ tag @username
3. **Chỉnh sửa và xóa** comment
4. **Hiển thị phân cấp** comment theo cấu trúc cây
5. **Phân trang** để tải thêm comment
6. **Giao diện thân thiện** với avatar, tên người dùng và thời gian
7. **Điều hướng đến profile** khi click vào tên người dùng hoặc tag @username

## 🔄 Tích hợp với các tính năng khác

- **Authentication**: Xác thực người dùng để thực hiện các hành động
- **Profile**: Hiển thị thông tin người dùng trong comment
- **Post**: Liên kết comment với bài đăng tương ứng
- **Notification**: Thông báo cho người dùng về hoạt động comment