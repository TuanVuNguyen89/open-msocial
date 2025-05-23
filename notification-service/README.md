# 🔔 Open MSocial - Notification Service

## 📌 Overview

The **Notification Service** is responsible for managing and delivering notifications to users in the Open MSocial platform. It handles user notifications for various events such as friend requests, post likes, comments, and system announcements.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementing REST APIs
- **MongoDB**: NoSQL database for storing notification data
- **Spring Data MongoDB**: For database interaction
- **Spring Security**: For authentication and authorization
- **Kafka**: For event-driven communication with other services
- **SendGrid**: For email notification delivery

## 🧩 Data Model

### `Notification`
| Field         | Data Type    | Description                    |
|---------------|--------------|--------------------------------|
| `id`          | string       | Primary key                    |
| `userId`      | string       | Recipient user ID              |
| `type`        | enum         | FRIEND_REQUEST, LIKE, etc.     |
| `content`     | string       | Notification message           |
| `sourceId`    | string       | Related entity ID              |
| `sourceType`  | enum         | POST, COMMENT, USER, etc.      |
| `sourceUserId`| string       | ID of the triggering user      |
| `isRead`      | boolean      | Whether notification is read   |
| `createdAt`   | Date         | Creation timestamp             |

## 📡 API Endpoints

### Notification Management
- **GET** `/notification/notifications` - Get current user's notifications
- **PUT** `/notification/notifications/{notificationId}/read` - Mark notification as read
- **PUT** `/notification/notifications/read-all` - Mark all notifications as read

### Notification Settings
- **GET** `/notification/settings` - Get user notification settings
- **PUT** `/notification/settings` - Update notification settings

## 🔄 Kafka Event Consumption

The service consumes the following events to create notifications:
- `user-followed`: When a user follows another user
- `friend-request-sent`: When a friend request is sent
- `friend-request-accepted`: When a friend request is accepted
- `post-liked`: When a post is liked
- `post-commented`: When a post receives a comment
- `comment-replied`: When a comment receives a reply

## 🚀 How to Run

### Prerequisites
- Java 21
- Maven
- MongoDB
- Kafka
- SendGrid API key (for email notifications)

### Local Development
1. Ensure MongoDB is running and accessible with credentials in `application.yaml`
2. Ensure Kafka is running and accessible
3. Run the service:
```bash
mvn spring-boot:run
```

### Using Docker
1. Build the Docker image:
```bash
docker build -t notification-service .
```

2. Run the container:
```bash
docker run -p 8082:8082 \
  -e SPRING_DATA_MONGODB_URI=mongodb://root:root@host.docker.internal:27017/notification-service?authSource=admin \
  -e SPRING_KAFKA_BOOTSTRAP-SERVERS=host.docker.internal:9094 \
  -e NOTIFICATION_EMAIL_SENDGRID-APIKEY=your-sendgrid-apikey \
  notification-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up notification-service
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

- **Identity Service**: User authentication and authorization
- **Profile Service**: User information for notifications
- **Post Service**: Post-related notifications
- **Comment Service**: Comment-related notifications

## Prerequisites

### Mongodb
Install Mongodb from Docker Hub

`docker pull bitnami/mongodb:7.0.11`

Start Mongodb server at port 27017 with root username and password: root/root

`docker run -d --name mongodb-7.0.11 -p 27017:27017 -e MONGODB_ROOT_USER=root -e MONGODB_ROOT_PASSWORD=root bitnami/mongodb:7.0.11`
