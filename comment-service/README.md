# 💬 Open MSocial - Comment Service

## 📌 Overview

The **Comment Service** is a microservice component of the Open MSocial platform that manages comment functionality. It provides APIs for creating, retrieving, updating, and deleting comments on posts, as well as supporting hierarchical comment structures with parent-child relationships.

## ⚙️ Technologies Used

### Backend Framework
- **Spring Boot 3.2.5**: Core framework for building the microservice
- **Java 21**: Programming language used for development

### Database
- **MongoDB**: NoSQL database for storing comment data
- **Spring Data MongoDB**: Integration library for MongoDB with Spring applications

### API & Communication
- **Spring Web**: RESTful API development
- **Spring Cloud OpenFeign**: Declarative REST client for service-to-service communication
- **RESTful API**: HTTP-based API design pattern

### Security
- **Spring Security**: Authentication and authorization framework
- **OAuth2 Resource Server**: JWT token validation and processing
- **JWT (JSON Web Tokens)**: Secure authentication mechanism

### Data Processing
- **Lombok**: Reduces boilerplate code (getters, setters, constructors)
- **MapStruct**: Object mapping between DTOs and entities
- **Jackson**: JSON serialization/deserialization

### Build Tools
- **Maven**: Dependency management and build automation
- **Spring Boot Maven Plugin**: Packaging and deployment support

### Testing
- **Spring Boot Test**: Testing framework
- **JaCoCo**: Code coverage reporting

### Code Quality
- **Spotless**: Code formatting and style enforcement

## 🧩 Data Model

### `Comment` Entity
| Field         | Data Type    | Description                     |
|---------------|--------------|----------------------------------|
| `id`          | String       | MongoDB document ID (primary key) |
| `postId`      | String       | ID of the associated post       |
| `userId`      | String       | ID of the comment creator       |
| `content`     | String       | Textual content of the comment  |
| `createdAt`   | Instant      | Comment creation timestamp      |
| `updatedAt`   | Instant      | Last update timestamp           |
| `rootId`      | String       | ID of the root comment (for hierarchical structure) |
| `pUserId`     | String       | ID of the parent comment's user (for replies) |

## 🧩 Service Architecture

### 1. Controller Layer
- **CommentController**: REST API endpoints for comment operations
  - Creating new comments
  - Updating existing comments
  - Deleting comments
  - Retrieving comments with pagination support
  - Handling root comments and replies separately

### 2. Service Layer
- **CommentService**: Business logic implementation
  - Comment creation with user information
  - Comment updating with validation
  - Comment deletion with authorization
  - Hierarchical comment retrieval
  - Integration with user profile service

### 3. Repository Layer
- **CommentRepository**: Data access interface
  - MongoDB CRUD operations
  - Custom query methods for comment retrieval
  - Pagination support

### 4. External Communication
- **ProfileClient**: OpenFeign client for user profile service integration
  - Retrieving user profile information
  - Validating user relationships

## 📡 API Endpoints

### Comment Management
- **POST** `/comment/create` - Create new comment
- **PUT** `/comment/update/{id}` - Update existing comment
- **DELETE** `/comment/delete/{id}` - Delete comment

### Comment Retrieval
- **GET** `/comment/post/{postId}/paginated` - Get root comments for a post with pagination
- **GET** `/comment/root/{rootId}/paginated` - Get replies for a specific root comment with pagination
- **GET** `/comment/post/{postId}/all/paginated` - Get all comments for a post (both root and replies) with pagination

### Response Format
All API endpoints return responses in a standardized `ApiResponse<T>` format with the actual result wrapped inside.

## 🚀 Key Features

1. **Hierarchical Comment Structure**: Support for root comments and nested replies
2. **JWT-based Security**: Secure authentication and authorization
3. **User Context Integration**: Retrieving and associating user information with comments
4. **Pagination Support**: Efficient retrieval of comments in paginated format
5. **Service-to-Service Communication**: Integration with profile service using OpenFeign
6. **MongoDB Document Storage**: Flexible NoSQL data storage
7. **RESTful API Design**: Clean and consistent API endpoints

## 🔄 Integration with Other Services

- **Profile Service**: Retrieves user information for comments
- **Authentication Service**: Validates JWT tokens for secure operations
- **Post Service**: Comments are associated with specific posts
- **Web Application**: Provides the frontend interface for interacting with comments

## 🛠️ Development & Deployment

- **Local Development**: Runs on port 8084 with context path `/comment`
- **MongoDB Configuration**: Connects to MongoDB at localhost:27017
- **Docker Support**: Includes Dockerfile for containerization
- **Maven Build**: Uses Maven for dependency management and building
- **Code Quality**: Enforces code style with Spotless plugin
- **Testing**: Includes JUnit testing with JaCoCo coverage reporting