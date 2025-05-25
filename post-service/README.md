# 📝 Open MSocial - Post Service

## 📌 Overview

The **Post Service** is responsible for managing user posts in the Open MSocial platform. It handles the creation, retrieval, updating, and deletion of posts, as well as managing post visibility based on user relationships.

## ⚙️ Technologies Used

- **Spring Boot**: Backend framework for implementing REST APIs
- **MongoDB**: NoSQL database for storing post data
- **Spring Data MongoDB**: For database interaction and repository support
- **Spring Security**: For authentication and authorization
- **Kafka**: For event-driven communication with other services

## 🧩 Data Model

### `Post`
| Field         | Data Type    | Description                    |
|---------------|--------------|--------------------------------|
| `id`          | string       | Primary key                    |
| `userId`      | string       | ID of the post creator         |
| `content`     | string       | Textual content of the post    |
| `createdDate` | Instant      | Post creation timestamp        |
| `modifiedDate`| Instant      | Last update timestamp          |
| `visibility`  | Visibility   | PUBLIC, FRIENDS, PRIVATE       |

### `Visibility`
Enum with values:
- `PUBLIC`: Visible to all users
- `FRIENDS`: Visible only to friends
- `PRIVATE`: Visible only to the creator

## 📡 API Endpoints

### Post Management
- **POST** `/post/create` - Create a new post
- **GET** `/post/{postId}` - Get post by ID
- **PUT** `/post/{postId}` - Update post
- **DELETE** `/post/{postId}` - Delete post

### Post Discovery
- **GET** `/post/my-posts` - Get current user's posts (paginated)
- **GET** `/post/user-posts/{userId}` - Get posts by user (paginated)
- **GET** `/post/get-feed` - Get posts for current user's feed (paginated)

### Internal API
- **GET** `/post/internal/{postId}` - Get post by ID (service-to-service)

## 🔄 Kafka Events

### Published Events
- `post-created` - When a new post is created
- `post-updated` - When a post is updated
- `post-deleted` - When a post is deleted

## 🚀 How to Run

### Prerequisites
- Java
- Maven
- MongoDB
- Kafka

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
docker build -t post-service .
```

2. Run the container:
```bash
docker run -p 8083:8083 \
  -e SPRING_DATA_MONGODB_URI=mongodb://root:root@host.docker.internal:27017/post-service?authSource=admin \
  -e SPRING_KAFKA_BOOTSTRAP-SERVERS=host.docker.internal:9094 \
  -e APP_SERVICES_PROFILE_URL=http://host.docker.internal:8081/profile \
  post-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up post-service
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

- **Identity Service**: User authentication and authorization
- **Profile Service**: User information for posts and friendship verification
- **Notification Service**: Notifications for post interactions