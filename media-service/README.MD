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

## Features

*   **Upload Media:** Upload images and videos to a cloud storage provider (e.g., Cloudinary).
*   **Retrieve Media:** Get media information by ID or URL.
*   **Delete Media:** Delete media files from cloud storage.
*   **Update Metadata:** Update the metadata associated with media files (e.g., descriptions, tags).
*   **Stream Media:** Stream media content directly to clients.
*   **Environment Variable Configuration:** Uses environment variables for sensitive configuration (API keys, database credentials).
*   **Dockerized:** Can be easily containerized using Docker.

## Technologies Used

*   Java 21
*   Spring Boot 3.4.5
*   Spring Data JPA
*   Hibernate ORM
*   MySQL
*   Cloudinary (or your preferred cloud storage provider)
*   MapStruct
*   Lombok
*   Maven
*   Docker

## Prerequisites

*   Java Development Kit (JDK) 21 or later
*   Maven 3.6 or later
*   Docker (if you want to run the application in a container)
*   A MySQL database
*   A Cloudinary account (or an account with your preferred cloud storage provider)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your_repository_url>
    cd media-service
    ```

2.  **Configure Environment Variables:**

    Create a `.env` file in the root directory of the project and add the following environment variables:

    ```
    SERVER_PORT=8080
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/media_db
    SPRING_DATASOURCE_USERNAME=your_db_username
    SPRING_DATASOURCE_PASSWORD=your_db_password
    ```

    Replace the placeholder values with your actual configuration.  *Do not commit the `.env` file to your repository!*

3.  **Build the Application:**

    ```bash
    mvn clean install
    ```

4.  **Run the Application:**

    *   **From the command line:**
        ```bash
        mvn spring-boot:run
        ```

    *   **From your IDE:**  Run the `MediaServiceApplication` class.

## Running with Docker

1.  **Build the Docker Image:**
    ```bash
    docker build -t your_media_service_image .
    ```

2.  **Run the Docker Container:**
    ```bash
    docker run -d \
      -p 8080:8085 \
      -e SERVER_PORT=8080 \
      -e CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name \
      -e CLOUDINARY_API_KEY=your_cloudinary_api_key \
      -e CLOUDINARY_API_SECRET=your_cloudinary_api_secret \
      -e SPRING_DATASOURCE_URL=jdbc:mysql://some-mysql-host:3306/media_db \
      -e SPRING_DATASOURCE_USERNAME=your_db_username \
      -e SPRING_DATASOURCE_PASSWORD=your_db_password \
      your_media_service_image
    ```

    Replace the placeholder values with your actual configuration.

## API Endpoints

*   `POST /api/media/upload`: Upload media.
*   `GET /api/media/{id}`: Get media by ID.
*   `DELETE /api/media/{id}`: Delete media.
*   `PUT /api/media/{id}/metadata`: Update media metadata.
*   `GET /api/media/stream/{id}`: Stream media.

See the API documentation for details on request and response formats.

## Contributing

Contributions are welcome! Please submit a pull request.

## License

[Your License] (e.g., MIT License)