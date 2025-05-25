# 👤 Open MSocial - Profile Service

## 📌 Overview

The **Profile Service** is responsible for managing user profiles and social relationships in the Open MSocial platform. It handles user profile information, friend requests, and friend connections.

## ⚙️ Technologies Used

- **Spring Boot**: Backend framework for implementing REST APIs
- **MySQL**: Database for storing user profile information and relationships
- **Spring Data JPA**: For database interaction and ORM
- **Spring Security**: For authentication and authorization

## 🧩 Entity Structure

### `UserProfile`
| Field          | Data Type    | Description                    |
|----------------|--------------|--------------------------------|
| `id`           | string (UUID)| Primary key                    |
| `userId`       | string       | ID from Identity Service       |
| `username`     | string       | Username                       |
| `email`        | string       | Email address                  |
| `firstName`    | string       | First name                     |
| `lastName`     | string       | Last name                      |
| `dob`          | LocalDate    | Date of birth (optional)       |
| `city`         | string       | City of residence              |
| `avatarUrl`    | string       | Profile picture URL            |
| `backgroundUrl`| string       | Profile background image URL   |

### `UserRelationship`
| Field             | Data Type        | Description                    |
|-------------------|------------------|--------------------------------|
| `id`              | string (UUID)    | Primary key                    |
| `senderId`        | string           | User who initiated the relationship |
| `receiverId`      | string           | Target user of the relationship|
| `relationshipType`| RelationshipType | Type of relationship           |

### `RelationshipType`
Enum with values:
- `FRIEND`: Users are friends
- `SENT_FRIEND_REQUEST`: Friend request has been sent

## 📡 API Endpoints

### Profile Management
- **GET** `/profile/users/{id}` - Get user profile by profile ID
- **GET** `/profile/users/search?username={username}` - Search user by username
- **GET** `/profile/users/my-profile` - Get current user's profile
- **PUT** `/profile/users/{id}` - Update user profile
- **GET** `/profile/users` - Get all profiles (admin only)

### Friend Management
- **POST** `/profile/relationship/send-friend-request/{receiverId}` - Send friend request
- **POST** `/profile/relationship/accept-friend-request/{receiverId}` - Accept friend request
- **POST** `/profile/relationship/reject-friend-request/{senderId}` - Reject friend request
- **POST** `/profile/relationship/cancel-friend-request/{receiverId}` - Cancel sent friend request
- **DELETE** `/profile/relationship/remove-friend/{receiverId}` - Remove friend

### Relationship Queries
- **GET** `/profile/relationship/get-relationship?userId1={userId1}&userId2={userId2}` - Get relationship between users
- **GET** `/profile/relationship/friends/{userId}` - Get user's friends (paginated)
- **GET** `/profile/relationship/my-friends` - Get current user's friends (paginated)
- **GET** `/profile/relationship/pending-requests` - Get pending friend requests (paginated)


## 🚀 How to Run

### Prerequisites
- Java
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
- **Notification Service**: Sends notifications for friend requests
