# 👤 User Module - Open MSocial

## 🗂 Công nghệ sử dụng
- **Backend**: Java + Spring Boot
- **Cơ sở dữ liệu**: Neo4j (mô hình đồ thị)
- **Mục tiêu**:
  - Lưu trữ thông tin hồ sơ người dùng.
  - Xây dựng các mối quan hệ xã hội: kết bạn, theo dõi.
  - Cho phép cập nhật thông tin cá nhân, truy xuất dữ liệu liên quan đến mối quan hệ xã hội.

---

## 🧾 Cấu trúc bảng: `UserProfile`

| Trường       | Kiểu dữ liệu | Mô tả                                |
|--------------|--------------|--------------------------------------|
| `id`         | string (UUID)| Khóa chính, tự động sinh             |
| `userId`     | string       | ID ánh xạ đến người dùng trong Auth |
| `username`   | string       | Tên đăng nhập                       |
| `email`      | string       | Email người dùng                    |
| `firstName`  | string       | Tên                                 |
| `lastName`   | string       | Họ                                  |
| `dob`        | LocalDate    | Ngày sinh                           |
| `city`       | string       | Thành phố cư trú                    |

---

## 🕸️ Các mối quan hệ trong Neo4j

### 🔁 `FRIENDS_WITH`
- Hai chiều
- Biểu thị quan hệ bạn bè
- Cypher:  
```cypher
MATCH (a:UserProfile {id: $id1}), (b:UserProfile {id: $id2})
MERGE (a)-[:FRIENDS_WITH]->(b)
MERGE (b)-[:FRIENDS_WITH]->(a)
```

# Tài liệu API Mối quan hệ người dùng

## Các loại mối quan hệ

### 👁️ `FOLLOWS`
Biểu thị hành vi theo dõi người dùng khác

**Cypher:**
```cypher
MATCH (a:UserProfile {id: $followerId}), (b:UserProfile {id: $targetId})
MERGE (a)-[:FOLLOWS]->(b)
```

## 📡 API Design

### 📌 Cập nhật thông tin người dùng
```
PUT /users/{userId}
```

**Request:**
```json
{
  "firstName": "Minh",
  "lastName": "Nguyen",
  "dob": "2000-05-08",
  "city": "Hanoi"
}
```

### 🤝 Gửi lời mời kết bạn
```
POST /users/{targetUserId}/friend-request
```

### ✅ Chấp nhận lời mời kết bạn
```
POST /users/{sourceUserId}/accept-friend-request
```

### ❌ Hủy kết bạn
```
DELETE /users/{userId}/friends/{targetUserId}
```

### ➕ Theo dõi người dùng khác
```
POST /users/{targetUserId}/follow
```

### ➖ Bỏ theo dõi
```
DELETE /users/{targetUserId}/unfollow
```

### 📋 Lấy danh sách bạn bè
```
GET /users/{userId}/friends
```

### 📋 Lấy danh sách người theo dõi
```
GET /users/{userId}/followers
```

### 📋 Lấy danh sách người đang theo dõi
```
GET /users/{userId}/following
```

## 🔍 Cypher Queries

### Tìm bạn bè của người dùng:
```cypher
MATCH (u:UserProfile {id: $userId})-[:FRIENDS_WITH]-(f:UserProfile)
RETURN f
```

### Tìm followers:
```cypher
MATCH (u:UserProfile {id: $userId})<-[:FOLLOWS]-(f:UserProfile)
RETURN f
```

### Tìm following:
```cypher
MATCH (u:UserProfile {id: $userId})-[:FOLLOWS]->(f:UserProfile)
RETURN f
```

## 📌 Ghi chú
- `userId` là ID ánh xạ từ Auth module (Keycloak hoặc hệ thống xác thực bạn đã xây).
- Chỉ những người dùng đã xác thực mới được phép truy cập hoặc chỉnh sửa thông tin cá nhân của mình.
- Tất cả các tương tác xã hội (kết bạn, theo dõi) đều phải được kiểm tra quyền truy cập hợp lệ thông qua API Gateway.

---

## 🛡️ Bảo mật & phân quyền
- Mọi endpoint trong module này đều phải xác thực JWT Token từ Auth module thông qua API Gateway.
- Chỉ người dùng sở hữu hồ sơ mới có quyền cập nhật hoặc xóa thông tin cá nhân.
- Kết bạn hoặc theo dõi yêu cầu ID của người gửi và người nhận, xác thực cả hai tồn tại.

---

## 📦 Kết nối với các module khác

| Module        | Mục đích liên kết                      |
|---------------|----------------------------------------|
| **Auth**      | Xác thực người dùng, ánh xạ `userId`   |
| **Post**      | Hiển thị bài viết theo bạn bè/follow   |
| **Feed**      | Tạo newsfeed từ danh sách follow/friend |
| **Notification** | Gửi thông báo khi có người theo dõi mới hoặc kết bạn |

---

## 🚀 Mở rộng tương lai
- Thêm các thuộc tính: ảnh đại diện, mô tả bản thân, giới tính, trạng thái online.
- Gợi ý bạn bè dựa trên bạn chung (`mutual friends`) bằng Cypher.
- Giới hạn số lượng kết bạn hoặc follow theo chính sách người dùng.
- Thêm thời gian tạo/sửa hồ sơ (createdAt, updatedAt).
- Tạo hệ thống block/report giữa các user nếu cần.

---

## ✅ Kiểm thử đề xuất
- Kiểm thử khả năng truy vấn đồ thị với hàng ngàn node.
- Đảm bảo cập nhật hồ sơ không ảnh hưởng đến quan hệ hiện có.
- Kiểm thử quyền truy cập trên mỗi endpoint.

---

## 📁 Ví dụ mẫu JSON trả về

### Thông tin người dùng:
```json
{
  "id": "2a5f49a9-8cf2-4b88-b13e-b0d01ea79999",
  "userId": "92ab1ad8-1dc3-4ef2-b13d-c3e1bb3385d2",
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1995-08-17",
  "city": "Ho Chi Minh"
}
