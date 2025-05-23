# 🛡️ Open MSocial - Identity Service

## 📌 Objectives

The **Identity Service** is responsible for authentication and authorization for users accessing the Open MSocial system.  
All requests from the client must go through the **API Gateway**, and the gateway will communicate with the Identity Service to verify the validity of requests.

---

## ⚙️ Technologies Used

- **Spring Boot 3**: Implements REST APIs for authentication and authorization services.
- **JWT**: Used for request authentication after login.
- **Google OAuth2**: Used for request authentication from the client when logging in with Google account.
- **MySQL**: Database for storing user authentication information.

---

## 🧩 Entity Structure

### `User`
| Field            | Data Type    | Description                  |
|------------------|--------------|------------------------------|
| `id`             | string (UUID)| Primary key                  |
| `username`       | string       | Login username               |
| `password`       | string       | Encrypted password           |
| `email`          | string       | Email address                |
| `roles`          | List<Role>   | List of roles                |

### `Role`
| Field         | Data Type       | Description                   |
|---------------|-----------------|-------------------------------|
| `name`        | string (PK)     | Role name (e.g., ADMIN)       |
| `description` | string          | Role description              |

### `InvalidatedToken`
| Field         | Data Type | Description                   |
|---------------|-----------|-------------------------------|
| `id`          | string (PK)| Revoked access token         |
| `expiryTime`  | Date      | Expiration time of the token |

---

## 🔐 Authentication Flow

### 1. Register

- User sends `username`, `email`, `password` information to the registration API.
- System:
    - Creates account in the `Identity` module, if successful, creates user in the `User` module.

### 2. Login

- Account login flow:
    - User sends `username/email` and `password` to the login API.
    - System:
        - Verifies account in the `Identity` module.
    - If valid, returns:
        - Access Token (JWT)

- Google account login flow:
    - User sends `code` received from Google to the `/auth/outbound/authentication` API for verification.
    - System:
        - Verifies account in the `Identity` module.
    - If valid, returns:
        - Access Token (JWT)

- **Token will be stored by the client in the browser's Local Storage.**

### 3. Validate Token

- Every request going through **API Gateway** sends the token to **Identity Service** for authentication.
- Identity Service will check:
    - Is the token valid?
    - Is the token in the `InvalidatedToken` list?
    - Has the token expired?

### 4. Logout

- When the user logs out, the current token will be added to `InvalidatedToken` until it expires.

---

## 📛 Authorization

- Each `User` can have multiple `Role`.
- Each `Role` contains multiple `Permission`.
- Authorization will be performed at each module level.

---

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
docker build -t identity-service .
```

2. Run the container:
```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/oms_identity \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=123456 \
  identity-service
```

### Using Docker Compose
The service can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up identity-service
```

For the entire stack:
```bash
docker-compose up
```

---

## 📡 API Endpoints

- **POST** `/identity/auth/register` - Register new user
- **POST** `/identity/auth/login` - Login with username/email and password
- **POST** `/identity/auth/outbound/authentication` - Login with Google
- **POST** `/identity/auth/logout` - Logout user
- **GET** `/identity/auth/validate` - Validate token