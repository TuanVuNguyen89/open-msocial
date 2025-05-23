# 🖼️ Open MSocial - Media Service

## 📌 Overview

The **Media Service** is responsible for handling media files (images, videos) in the Open MSocial platform. It manages the upload, storage, retrieval, and association of media files with users and posts.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementing REST APIs
- **MySQL**: Database for storing media metadata
- **Spring Data JPA**: For database interaction
- **Spring Security**: For authentication and authorization
- **Cloudinary**: Cloud service for storing and serving media files

## 🧩 Data Model

### `Media`
| Field         | Data Type    | Description                    |
|---------------|--------------|--------------------------------|
| `id`          | string (UUID)| Primary key                    |
| `userId`      | string       | ID of the media owner          |
| `type`        | enum         | IMAGE, VIDEO, etc.             |
| `url`         | string       | Public URL to access the media |
| `thumbnailUrl`| string       | Thumbnail URL (for videos)     |
| `cloudinaryId`| string       | ID in the cloud storage        |
| `createdAt`   | Date         | Creation timestamp             |
| `metadata`    | JSON         | Additional metadata            |

## 📡 API Endpoints

### Media Management
- **POST** `/media/upload` - Upload new media file
- **GET** `/media/{mediaId}` - Get media details
- **DELETE** `/media/{mediaId}` - Delete media

### Media Queries
- **GET** `/media/user/{userId}` - Get media by user
- **GET** `/media/post/{postId}` - Get media associated with a post

## 🚀 How to Run

### Prerequisites
- Java 21
- Maven
- MySQL
- Cloudinary account (for production)

### Environment Variables
The following environment variables need to be set:
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Local Development
1. Ensure MySQL is running and accessible with credentials in `application.yaml`
2. Set the Cloudinary environment variables
3. Run the service:
```bash
mvn spring-boot:run
```

### Using Docker
1. Build the Docker image:
```bash
docker build -t media-service .
```

2. Run the container:
```bash
docker run -p 8085:8085 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/oms_media \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  -e CLOUDINARY_API_KEY=your-api-key \
  -e CLOUDINARY_API_SECRET=your-api-secret \
  media-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up media-service
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

- **Identity Service**: User authentication and authorization
- **Profile Service**: User information for media ownership
- **Post Service**: Association of media with posts