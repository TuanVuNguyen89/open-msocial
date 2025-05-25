# 💬 Open MSocial - Comment Feature

## 📌 Overview

The **Comment Feature** allows users to interact with posts on the Open MSocial platform. The system supports creating, viewing, editing, and deleting comments, as well as displaying comments in a hierarchical structure.

## ⚙️ Technologies Used

- **React**: JavaScript library for building user interfaces
- **Material UI**: UI framework for components
- **React Router**: Navigation management in the application
- **Axios**: Handling HTTP requests to the API

## 🧩 Data Model

### `Comment`
| Field         | Data Type    | Description                     |
|---------------|--------------|----------------------------------|
| `id`          | string       | Primary key                     |
| `postId`      | string       | ID of the associated post       |
| `content`     | string       | Textual content of the comment  |
| `parentId`    | string       | ID of parent comment (if reply) |
| `createdAt`   | Date         | Comment creation timestamp      |
| `updatedAt`   | Date         | Last update timestamp           |
| `user`        | object       | Information about comment creator |
| `pUser`       | object       | Information about replied user (if reply) |

## 🧩 Component Structure

### 1. CommentSection
Main component managing the entire comment section of a post, including:
- Displaying the list of comments
- Pagination for loading more comments
- Managing the form for creating new comments

### 2. CommentItem
Displays a single comment with:
- User avatar and username
- Comment content with @username tag support
- Creation/update timestamp
- Interaction buttons (reply, edit, delete)
- Displaying child comments (replies) in a tree structure

### 3. CommentForm
Form for creating or editing comments:
- Input for comment content
- Support for @username tagging
- Handling comment submission/update submission

## 📡 API Endpoints

### Comment Management
- **POST** `/api/comments` - Create new comment
- **GET** `/api/comments/{commentId}` - Get comment by ID
- **PUT** `/api/comments/{commentId}` - Update comment
- **DELETE** `/api/comments/{commentId}` - Delete comment

### Comment Query
- **GET** `/api/posts/{postId}/comments` - Get comments for a post
- **GET** `/api/comments/{commentId}/replies` - Get replies for a comment
- **GET** `/api/users/{userId}/comments` - Get comments by user

## 🚀 Main Features

1. **Create a new comment** on a post
2. **Reply to a comment** with @username support
3. **Edit and delete** comment
4. **Display hierarchical** comment structure
5. **Pagination** to load additional comments
6. **Friendly interface** with avatar, username, and timestamp
7. **Navigate to profile** when clicking on username or @username

## 🔄 Integration with other features

- **Authentication**: User authentication to perform actions
- **Profile**: Display user information in comments
- **Post**: Link comments to the corresponding post
- **Notification**: Notify users about comment activities