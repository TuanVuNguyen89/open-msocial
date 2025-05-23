# 👤 Open MSocial - Profile Service

## 📌 Overview

The **Profile Service** is responsible for managing user profiles and social relationships in the Open MSocial platform. It handles user profile information, friend connections, and follower relationships.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementing REST APIs
- **MySQL**: Database for storing user profile information
- **Spring Data JPA**: For database interaction
- **Spring Security**: For authentication and authorization

## 🧩 Entity Structure

### `UserProfile`
| Field       | Data Type    | Description                    |
|-------------|--------------|--------------------------------|
| `id`        | string (UUID)| Primary key                    |
| `userId`    | string       | ID from Identity Service       |
| `username`  | string       | Username                       |
| `email`     | string       | Email address                  |
| `firstName` | string       | First name                     |
| `lastName`  | string       | Last name                      |
| `dob`       | LocalDate    | Date of birth (optional)       |
| `city`      | string       | City of residence              |

## 🔄 Relationships

### `FRIENDS_WITH`
- Bidirectional relationship between users
- Represents a mutual friendship connection

### `FOLLOWS`
- Unidirectional relationship
- Represents a user following another user

## 📡 API Endpoints

### Profile Management
- **GET** `/profile/users/{userId}` - Get user profile
- **PUT** `/profile/users/{userId}` - Update user profile

### Friend Management
- **POST** `/profile/users/{targetUserId}/friend-request` - Send friend request
- **POST** `/profile/users/{sourceUserId}/accept-friend-request` - Accept friend request
- **DELETE** `/profile/users/{userId}/friends/{targetUserId}` - Remove friend

### Follow Management
- **POST** `/profile/users/{targetUserId}/follow` - Follow user
- **DELETE** `/profile/users/{targetUserId}/unfollow` - Unfollow user

### Relationship Queries
- **GET** `/profile/users/{userId}/friends` - List friends
- **GET** `/profile/users/{userId}/followers` - List followers
- **GET** `/profile/users/{userId}/following` - List users being followed

## 🚀 How to Run

### Prerequisites
- Java 21
- Maven
- MySQL

### Local Development
1. Ensure MySQL is running and accessible with credentials in `application.yaml`
2. Run the service:
```bash
mvn spring-boot:run
```

### Using Docker
1. Build the Docker image:
```bash
docker build -t profile-service .
```

2. Run the container:
```bash
docker run -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/oms_user \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  profile-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up profile-service
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

- **Identity Service**: User authentication and ID mapping
- **Post Service**: Content creation associated with user profiles
- **Notification Service**: Sends notifications for friend requests and new followers
