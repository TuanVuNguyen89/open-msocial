# Media Service

This is a Spring Boot-based microservice for managing media files (images, videos). It allows you to upload, retrieve, delete, and stream media, as well as update metadata.

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