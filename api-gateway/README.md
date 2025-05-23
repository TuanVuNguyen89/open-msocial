# 🔍 Open MSocial - API Gateway

## 📌 Overview

The **API Gateway** serves as the central entry point for all client requests to the Open MSocial platform. It routes requests to the appropriate microservices, handles authentication/authorization, and provides cross-cutting concerns like rate limiting and request logging.

## ⚙️ Technologies Used

- **Spring Boot 3**: Backend framework for implementation
- **Spring Cloud Gateway**: For routing requests to microservices
- **Spring Security**: For authentication and authorization
- **JWT**: For token validation

## 🔄 Routing Configuration

The API Gateway routes requests to the following services:

| Route                   | Service              | Port |
|-------------------------|----------------------|------|
| `/api/v1/identity/**`   | Identity Service     | 8080 |
| `/api/v1/profile/**`    | Profile Service      | 8081 |
| `/api/v1/notification/**` | Notification Service | 8082 |
| `/api/v1/post/**`       | Post Service         | 8083 |
| `/api/v1/comment/**`    | Comment Service      | 8084 |
| `/api/v1/media/**`      | Media Service        | 8085 |

## 🛡️ Security

The API Gateway handles authentication for all incoming requests:

1. Extracts JWT token from Authorization header
2. Forwards token to Identity Service for validation
3. Applies appropriate authorization rules based on the validated token
4. Routes the request to the appropriate service if authentication/authorization succeeds

## 🚀 How to Run

### Prerequisites
- Java 21
- Maven

### Local Development
1. Ensure all microservices are running and accessible
2. Run the service:
```bash
mvn spring-boot:run
```

### Using Docker
1. Build the Docker image:
```bash
docker build -t api-gateway .
```

2. Run the container:
```bash
docker run -p 8888:8888 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[0].URI=http://host.docker.internal:8080 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[1].URI=http://host.docker.internal:8081 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[2].URI=http://host.docker.internal:8082 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[3].URI=http://host.docker.internal:8083 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[4].URI=http://host.docker.internal:8084 \
  -e SPRING_CLOUD_GATEWAY_ROUTES[5].URI=http://host.docker.internal:8085 \
  api-gateway
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up api-gateway
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Other Services

The API Gateway integrates with all services in the Open MSocial platform, acting as the single entry point for client applications.

## 💻 Configuration Properties

Key properties in the application.yaml file:

```yaml
server:
  port: 8888

app:
  api-prefix: /api/v1

spring:
  cloud:
    gateway:
      routes:
        - id: identity_service
          uri: http://localhost:8080
          predicates:
          - Path=${app.api-prefix}/identity/**
          filters:
          - StripPrefix=2
        # Additional routes for other services
