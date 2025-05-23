# 📺 Open MSocial - Web Application

## 📌 Overview

The **Web Application** is the frontend component of the Open MSocial platform. It provides a modern, responsive user interface for interacting with the social media platform's features including user authentication, profile management, posts, comments, and notifications.

## ⚙️ Technologies Used

- **React**: Frontend JavaScript library
- **Material UI**: Component library for consistent design
- **React Router**: For navigation and routing
- **Axios**: For API requests
- **Framer Motion**: For animations
- **React Markdown**: For rendering markdown content

## 🔄 Key Features

- **Modern UI**: Sleek design with gradient backgrounds and frosted glass effects
- **Responsive Layout**: Works on desktop and mobile devices
- **Authentication**: Login, registration with email/password or Google account
- **Profile Management**: View and edit user profiles
- **Social Features**: Friend requests, following, and user search
- **Content Creation**: Create, edit, and delete posts with text and media
- **Interactions**: Like and comment on posts
- **Real-time Notifications**: Get notified of activities

## 🚀 How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```
The app will be available at http://localhost:3000

### Using Docker

1. Build the Docker image:
```bash
docker build -t web-app .
```

2. Run the container:
```bash
docker run -p 80:80 web-app
```

### Using Docker Compose

The web app can be run as part of the entire application stack:
```bash
# From the root directory
docker-compose up web-app
```

For the entire stack:
```bash
docker-compose up
```

## 🔄 Integration with Backend Services

The web application communicates with the backend services through the API Gateway:

- **Identity Service**: User authentication and registration
- **Profile Service**: User profile management and social connections
- **Post Service**: Creating and viewing posts
- **Comment Service**: Adding comments to posts
- **Media Service**: Uploading and viewing media
- **Notification Service**: Receiving notifications

## 🖥️ Available Scripts

In the project directory, you can run:
