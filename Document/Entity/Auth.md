
# 🛡️ Open MSocial - Auth Module

## 📌 Mục tiêu

Module **Auth** chịu trách nhiệm xác thực và phân quyền cho người dùng truy cập vào hệ thống Open MSocial.  
Tất cả các request từ phía client đều phải đi qua **ApiGateway**, và gateway sẽ giao tiếp với Auth để xác minh tính hợp lệ của các yêu cầu.

---

## ⚙️ Công nghệ sử dụng

- **Keycloak**: Identity Provider hỗ trợ OAuth2, OIDC, quản lý người dùng.
- **Spring Boot 3**: Triển khai các REST API phục vụ xác thực và phân quyền.
- **JWT**: Dùng để xác thực request sau khi đăng nhập.
- **Kafka**: Gửi sự kiện login/logout, thông báo xác thực email.

---

## 🧩 Entity Structure

### `User`
| Trường           | Kiểu dữ liệu | Mô tả                        |
|------------------|--------------|-------------------------------|
| `id`             | string (UUID)| Khóa chính                   |
| `username`       | string       | Tên đăng nhập                |
| `password`       | string       | Mật khẩu đã mã hóa           |
| `email`          | string       | Địa chỉ email                |
| `emailVerified`  | boolean      | Đã xác minh email hay chưa   |
| `roles`          | List<Role>   | Danh sách vai trò            |

### `Role`
| Trường        | Kiểu dữ liệu    | Mô tả                         |
|---------------|------------------|-------------------------------|
| `name`        | string (PK)      | Tên vai trò (VD: ADMIN)       |
| `description` | string           | Mô tả vai trò                 |

### `InvalidatedToken`
| Trường        | Kiểu dữ liệu | Mô tả                         |
|---------------|--------------|-------------------------------|
| `id`          | string (PK)  | Access token đã bị thu hồi   |
| `expiryTime`  | Date         | Thời gian hết hạn token đó   |

---

## 🔐 Authentication Flow

### 1. Register

- Người dùng gửi thông tin `username`, `email`, `password` đến API đăng ký.
- Hệ thống:
  - Tạo tài khoản chưa xác thực email.
  - Gửi sự kiện **VerifyEmail** qua Kafka đến module Notification để gửi email xác minh cho người dùng.
- Khi người dùng nhấn vào link xác minh trong email:
  - Gọi API `verify-email` tại module Auth.
  - Đánh dấu `emailVerified = true`.
  - **Gọi API nội bộ đến module User** để tạo thông tin hồ sơ người dùng (profile ban đầu).

### 2. Login

- Người dùng gửi `username/email` và `password` tới API đăng nhập.
- Nếu hợp lệ, trả về:
  - Access Token (JWT)
  - Refresh Token
- **Token sẽ được client lưu trữ tại Local Storage của trình duyệt.**

### 3. Validate Token

- Mọi request đi qua **ApiGateway** đều gửi token đến Auth để xác thực.
- Auth kiểm tra:
  - Token có hợp lệ không?
  - Token có nằm trong `InvalidatedToken` không?
  - Token đã hết hạn chưa?

### 4. Logout

- Khi người dùng đăng xuất, token hiện tại sẽ được đưa vào `InvalidatedToken` cho đến khi hết hạn.

---

## 📛 Phân quyền

- Mỗi `User` có thể có nhiều `Role`.
- Mỗi `Role` chứa nhiều `Permission`.
- Phân quyền sẽ được thực hiện tại từng module.