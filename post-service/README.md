# 📝 Open MSocial - Post Service

## 📌 Overview

The **Post Service** is responsible for managing user posts in the Open MSocial platform. It handles the creation, retrieval, updating, and deletion of posts, as well as interactions with posts.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementing REST APIs
- **MongoDB**: NoSQL database for storing post data
- **Spring Data MongoDB**: For database interaction
- **Spring Security**: For authentication and authorization
- **Kafka**: For event-driven communication with other services

## 🧩 Data Model

### `Post`
| Field         | Data Type    | Description                    |
|---------------|--------------|--------------------------------|
| `id`          | string       | Primary key                    |
| `userId`      | string       | ID of the post creator         |
| `content`     | string       | Textual content of the post    |
| `mediaIds`    | List<string> | Associated media IDs           |
| `tags`        | List<string> | Hashtags in the post           |
| `createdAt`   | Date         | Post creation timestamp        |
| `updatedAt`   | Date         | Last update timestamp          |
| `likeCount`   | int          | Number of likes                |
| `commentCount`| int          | Number of comments             |
| `visibility`  | enum         | PUBLIC, FRIENDS, PRIVATE       |

## 📡 API Endpoints

### Post Management
- **POST** `/post/posts` - Create a new post
- **GET** `/post/posts/{postId}` - Get post by ID
- **PUT** `/post/posts/{postId}` - Update post
- **DELETE** `/post/posts/{postId}` - Delete post

### Post Interactions
- **POST** `/post/posts/{postId}/like` - Like a post
- **DELETE** `/post/posts/{postId}/like` - Unlike a post
- **GET** `/post/posts/{postId}/likes` - Get users who liked a post

### Post Discovery
- **GET** `/post/users/{userId}/posts` - Get posts by user
- **GET** `/post/feed` - Get posts for current user's feed
- **GET** `/post/posts/trending` - Get trending posts

## 🔄 Kafka Events

### Published Events
- `post-created` - When a new post is created
- `post-updated` - When a post is updated
- `post-deleted` - When a post is deleted

## 🚀 How to Run

### Prerequisites
- Java 21
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
- **Profile Service**: User information for posts
- **Comment Service**: Comments on posts
- **Media Service**: Media attachments in posts
- **Notification Service**: Notifications for post interactions